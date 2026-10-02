import { config } from "./config";
import app from "./app";
import { disconnectDatabase } from "./services/prisma";

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log("=======================================================");
  console.log(
    `🚀 DevPath Interview Academy API Server running on port ${config.port}`,
  );
  console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
  console.log(`💡 Mode: ${config.nodeEnv}`);
  console.log(
    `🗄️  Database: ${
      config.isDatabaseConfigured
        ? "configured (probe on demand)"
        : "not configured — using in-memory store"
    }`,
  );

  if (config.usingInsecureDefaultSecret) {
    console.warn(
      "⚠️  JWT_SECRET is not set. Using the built-in development secret; never do this in production.",
    );
  }

  console.log("=======================================================");
});

let shuttingDown = false;

function handleShutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} signal received: closing HTTP server`);

  server.close(async () => {
    await disconnectDatabase();
    console.log("HTTP server closed and database connection released");
    process.exit(0);
  });

  // Do not hang forever on lingering keep-alive sockets.
  setTimeout(() => {
    console.warn("Forcing shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));

export default app;
