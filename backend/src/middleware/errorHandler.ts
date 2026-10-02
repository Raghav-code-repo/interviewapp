import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

/**
 * Translates known Prisma failures into client-safe responses. Without this,
 * a duplicate-email race (P2002) surfaced as an opaque 500 and Prisma error
 * payloads leaked internal column names and constraint names to the client.
 */
function mapPrismaError(err: Prisma.PrismaClientKnownRequestError) {
  switch (err.code) {
    case 'P2002': {
      const target = Array.isArray(err.meta?.target) ? (err.meta?.target as string[]) : [];
      const field = target.length ? target.join(', ') : 'value';
      return {
        statusCode: 409,
        code: 'CONFLICT',
        message: `A record with this ${field} already exists.`,
      };
    }
    case 'P2025':
      return {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'The requested record was not found.',
      };
    case 'P2003':
      return {
        statusCode: 400,
        code: 'INVALID_REFERENCE',
        message: 'A referenced record does not exist.',
      };
    default:
      return null;
  }
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.url} - validation failed`);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload or parameters',
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const mapped = mapPrismaError(err);
    if (mapped) {
      console.error(
        `[ERROR] ${new Date().toISOString()} ${req.method} ${req.url} - Prisma ${err.code}: ${err.message}`
      );
      return res.status(mapped.statusCode).json({
        success: false,
        error: { code: mapped.code, message: mapped.message },
      });
    }
  }

  // Malformed JSON bodies surface as a SyntaxError from express.json().
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON.' },
    });
  }

  const statusCode = err.statusCode || 500;

  console.error(
    `[ERROR] ${new Date().toISOString()} ${req.method} ${req.url} - Status: ${statusCode}:`,
    err
  );

  // In production we must not echo arbitrary error messages, which can contain
  // connection strings or internal paths.
  const message =
    statusCode >= 500 && config.isProduction
      ? 'An unexpected internal server error occurred'
      : err.message || 'An unexpected internal server error occurred';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message,
      ...(!config.isProduction && statusCode >= 500 && { details: err.stack }),
    },
  });
}
