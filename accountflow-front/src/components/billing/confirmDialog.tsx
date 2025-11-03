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
    <Modal
      show={show}
      onClose={onCancel}
      size="md"
      className="!rounded-2xl"
    >
      <div className="p-6 space-y-5 text-center bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex justify-center">
          <HiExclamationTriangle className="h-14 w-14 text-yellow-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 leading-relaxed">{message}</p>

        <div className="flex justify-center gap-3 mt-6">
          <Button
            onClick={onCancel}
            className=" bg-gray-200 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
          >
            {cancelText}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`bg-[#0b2034] hover:bg-[#12314d] text-white transition-colors cursor-pointer ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processando...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
