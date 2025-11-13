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
      <div className="space-y-4 bg-white p-6 dark:bg-white">
        <h2 className="text-xl font-bold text-gray-900">
          {editing ? 'Editar Plano de Contas' : 'Novo Plano de Contas'}
        </h2>

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

        <div className="mt-4 flex justify-end gap-2">
          <Button className="cursor-pointer bg-[#0b2034] text-white hover:bg-[#12314d]" onClick={handleSave}>
            {editing ? 'Salvar Alterações' : 'Salvar'}
          </Button>
          <Button className="cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-100" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
