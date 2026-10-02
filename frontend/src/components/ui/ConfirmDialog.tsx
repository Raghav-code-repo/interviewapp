import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-full shrink-0 ${
            variant === 'danger' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-300' : 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-300'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{message}</p>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end space-x-2">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
