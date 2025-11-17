'use client';

import { Modal, Label, TextInput, Button } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { BillingAccount } from '@/types/billingAccount';
import { getBillingAccounts } from '@/services/billingAccountSevice';

type TypeOfAccount = 'Sintética' | 'Analítica' | '';

type BillingAccountPayload = {
  name: string;
  account_type: 'analytic' | 'synthetic';
  parent: string | null;
  billing_plan: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  onSave: (data: BillingAccountPayload, uuid?: string) => void;
  editing?: BillingAccount | null;
  planId: string;
};

export default function BillingAccountForm({ show, onClose, onSave, editing, planId }: Props) {
  const [form, setForm] = useState({
    name: '',
    parentId: '',
    type_of: '' as TypeOfAccount,
  });

  const [parentOptions, setParentOptions] = useState<BillingAccount[]>([]);

  useEffect(() => {
    const fetchParentOptions = async () => {
      if (!planId) return;
      try {
        const data = await getBillingAccounts(planId);
        setParentOptions(data);
      } catch (err) {
        console.error('Erro ao buscar contas pai:', err);
      }
    };

    fetchParentOptions();
  }, [planId, show]);

  useEffect(() => {
    if (editing) {
      setForm({
        name: editing.name,
        parentId: editing.parent || '',
        type_of:
          editing.account_type === 'analytic' ? 'Analítica' : editing.account_type === 'synthetic' ? 'Sintética' : '',
      });
    } else {
      setForm({ name: '', parentId: '', type_of: '' });
    }
  }, [editing]);

  const generateParentOptions = (list: BillingAccount[], level = 0): { uuid: string; label: string }[] => {
    const map: { uuid: string; label: string }[] = [];
    list.forEach((acc) => {
      map.push({ uuid: acc.uuid, label: `${'  '.repeat(level)}${acc.code} - ${acc.name}` });
      if (acc.billingAccount_parent && acc.billingAccount_parent.length > 0) {
        map.push(...generateParentOptions(acc.billingAccount_parent, level + 1));
      }
    });
    return map;
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.type_of) return;

    const payload: BillingAccountPayload = {
      name: form.name.trim(),
      account_type: form.type_of === 'Analítica' ? 'analytic' : 'synthetic',
      parent: form.parentId || null,
      billing_plan: planId,
    };

    onSave(payload, editing?.uuid);
    onClose();
  };

  return (
    <Modal show={show} onClose={onClose}>
      <div className="space-y-4 p-6">
        <h2 className="text-xl font-bold text-gray-900">{editing ? 'Editar Conta Contábil' : 'Nova Conta Contábil'}</h2>

        <div>
          <Label htmlFor="name">Descrição</Label>
          <TextInput
            id="name"
            value={form.name}
            maxLength={255}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))}
            placeholder="Ex: ATIVO CIRCULANTE"
          />
        </div>

        <div>
          <Label htmlFor="parentId">Conta Pai (opcional)</Label>
          <select
            id="parentId"
            value={form.parentId}
            onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
            className="w-full rounded border px-2 py-1"
          >
            <option value="">Nenhuma (Conta Principal)</option>
            {generateParentOptions(parentOptions).map((opt) => (
              <option key={opt.uuid} value={opt.uuid}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="type_of">Tipo de Conta</Label>
          <select
            id="type_of"
            value={form.type_of}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type_of: e.target.value as TypeOfAccount,
              }))
            }
            className="w-full rounded border px-2 py-1"
          >
            <option value="">Selecione...</option>
            <option value="Sintética">Sintética</option>
            <option value="Analítica">Analítica</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button color="blue" onClick={handleSave}>
            {editing ? 'Salvar Alterações' : 'Salvar'}
          </Button>
          <Button color="gray" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
