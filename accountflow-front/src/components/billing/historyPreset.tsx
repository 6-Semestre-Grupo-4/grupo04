'use client';

import { Modal, Label, TextInput, Select, Button } from 'flowbite-react';
import { BillingPlan } from '@/types/billingPlan';
import { BillingAccount } from '@/types/billingAccount';
import { Preset } from '@/types/preset';
import { getAccountsByPlan } from '@/services/presetService';

type FormState = {
  name: string;
  description: string;
  billing_plan: string;
  payable_account: string;
  receivable_account: string;
};

type Props = {
  show: boolean;
  onClose: () => void;
  editing: Preset | null;
  plans: BillingPlan[];
  modalAccounts: BillingAccount[];
  setModalAccounts: (value: BillingAccount[]) => void;

  form: FormState;
  setForm: (value: FormState) => void;

  onSave: () => void;
  loading: boolean;
};

export default function HistoryPresetForm({
  show,
  onClose,
  editing,
  plans,
  modalAccounts,
  setModalAccounts,
  form,
  setForm,
  onSave,
  loading,
}: Props) {
  async function handlePlanChange(planUUID: string) {
    // Zera contas sempre que o plano muda
    setForm({
      ...form,
      billing_plan: planUUID,
      payable_account: '',
      receivable_account: '',
    });

    // Busca contas do plano
    if (planUUID) {
      const data = await getAccountsByPlan(planUUID);
      setModalAccounts(data);
    } else {
      setModalAccounts([]);
    }
  }

  return (
    <Modal show={show} size="lg" onClose={onClose} popup>
      <div className="space-y-5 rounded-xl bg-white p-8 dark:bg-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {editing ? 'Editar Histórico' : 'Novo Histórico'}
        </h3>

        <div className="grid gap-5">
          {/* Nome */}
          <div>
            <Label>Nome</Label>
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          {/* Descrição */}
          <div>
            <Label>Descrição</Label>
            <TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          {/* Plano */}
          <div>
            <Label>Plano de Contas</Label>
            <Select value={form.billing_plan} onChange={(e) => handlePlanChange(e.target.value)}>
              <option value="">Selecione...</option>

              {plans.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Contas só aparecem se tiver plano */}
          {form.billing_plan && (
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label>Conta Débito</Label>
                <Select
                  value={form.payable_account}
                  onChange={(e) => setForm({ ...form, payable_account: e.target.value })}
                >
                  <option value="">Selecione...</option>

                  {modalAccounts.map((acc) => (
                    <option key={acc.uuid} value={acc.uuid}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label>Conta Crédito</Label>
                <Select
                  value={form.receivable_account}
                  onChange={(e) => setForm({ ...form, receivable_account: e.target.value })}
                >
                  <option value="">Selecione...</option>

                  {modalAccounts.map((acc) => (
                    <option key={acc.uuid} value={acc.uuid}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4">
          <Button color="gray" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-gray-900 text-white shadow-md hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
