'use client';

import { Modal, Label, TextInput, Button } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { BillingPlan } from '@/types/billingPlan';

type Props = {
  show: boolean;
  onClose: () => void;
  onSave: (plan: { name: string; description: string }, uuid?: string) => void;
  editing?: BillingPlan | null;
};

export default function BillingPlanForm({ show, onClose, onSave, editing }: Props) {
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, description: editing.description });
    } else {
      setForm({ name: '', description: '' });
    }
  }, [editing]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave(form, editing?.uuid);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="p-8 bg-white dark:bg-gray-800 rounded-xl space-y-5">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {editing ? 'Editar Plano de Contas' : 'Novo Plano de Contas'}
        </h3>

        <div>
          <Label htmlFor="name">Nome</Label>
          <TextInput
            id="name"
            value={form.name}
            maxLength={255}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Plano Financeiro 2025"
          />
        </div>

        <div>
          <Label htmlFor="desc">Descrição</Label>
          <TextInput
            id="desc"
            value={form.description}
            maxLength={255}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrição"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button color="gray" onClick={handleSave}>
            {editing ? 'Salvar Alterações' : 'Salvar'}
          </Button>
          <Button
            className="bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white shadow-md"
            onClick={onClose}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
