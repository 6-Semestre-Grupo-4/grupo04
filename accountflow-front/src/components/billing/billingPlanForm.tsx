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
      <div className="bg-surface space-y-4 rounded-lg p-6">
        <h3 className="text-foreground text-xl font-bold">
          {editing ? 'Editar Plano de Contas' : 'Novo Plano de Contas'}
        </h3>

        <div>
          <Label htmlFor="name" className="text-text">
            Nome
          </Label>
          <TextInput
            id="name"
            value={form.name}
            maxLength={255}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Ex: Plano Financeiro 2025"
            className="bg-surface border-border text-foreground"
          />
        </div>

        <div>
          <Label htmlFor="desc" className="text-text">
            Descrição
          </Label>
          <TextInput
            id="desc"
            value={form.description}
            maxLength={255}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Descrição"
            className="bg-surface border-border text-foreground"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button className="btn-primary shadow-md" onClick={handleSave}>
            {editing ? 'Salvar Alterações' : 'Salvar'}
          </Button>
          <Button color="gray" className="bg-muted hover:bg-muted-foreground/20 cursor-pointer" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
