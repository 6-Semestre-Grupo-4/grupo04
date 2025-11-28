'use client';

import { HiExclamationTriangle } from 'react-icons/hi2';
import { Button } from 'flowbite-react';

type ConfirmDialogProps = {
  show: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  show,
  title = 'Confirmar Ação',
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md transform rounded-xl border border-white/20 bg-white/95 p-6 shadow-2xl transition-all dark:border-gray-700/30 dark:bg-gray-800/95"
        onClick={(e) => e.stopPropagation()}
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          animation: 'modalSlideUp 0.3s ease-out',
        }}
      >
        <div className="mb-4 flex items-center gap-2">
          <HiExclamationTriangle className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>

        <div className="mb-6 space-y-3">
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Esta ação não poderá ser desfeita.</p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            {loading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
