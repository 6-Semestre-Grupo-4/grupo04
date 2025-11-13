'use client';

import { Modal, Button } from 'flowbite-react';
import { HiExclamationTriangle } from 'react-icons/hi2';

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
  title = 'Confirmação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal show={show} onClose={onCancel} size="md" className="!rounded-2xl">
      <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-lg">
        <div className="flex justify-center">
          <HiExclamationTriangle className="h-14 w-14 text-yellow-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="leading-relaxed text-gray-600">{message}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={onCancel}
            className="cursor-pointer bg-gray-200 text-gray-700 transition-colors hover:bg-gray-100"
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`cursor-pointer bg-[#0b2034] text-white transition-colors hover:bg-[#12314d] ${
              loading ? 'cursor-not-allowed opacity-75' : ''
            }`}
          >
            {loading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
