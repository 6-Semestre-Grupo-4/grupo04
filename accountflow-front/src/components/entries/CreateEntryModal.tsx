'use client';

import { useState, useEffect } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { X, BadgeDollarSign, TrendingUp, TrendingDown, Banknote } from 'lucide-react';
import { Entry, PaymentMethod } from '@/types/entry';
import { Title } from '@/types/title';
import { getBillingAccounts, getPresets } from '@/services/presetService';

type EntryType = 'income' | 'expense';

type BillingAccountOption = {
  uuid: string;
  name: string;
  code: string;
  account_type: string;
};

type PresetOption = {
  uuid: string;
  name: string;
  description: string;
  payable_account?: string | null;
  receivable_account?: string | null;
  payable_name?: string;
  receivable_name?: string;
};

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Entry, uuid?: string) => void; // consumer monta payload no service
  entry?: Partial<Entry> | null; // pode vir sem uuid no create
  titles: (Title & {
    /* ensure id */
  })[];
  // força tipo (ex.: 'income' para Receber, 'expense' para Pagar)
  forceType?: 'income' | 'expense';
}

export default function CreateEntryModal({ isOpen, onClose, onSave, entry, titles, forceType }: CreateEntryModalProps) {
  const [form, setForm] = useState<{
    description: string;
    title: string; // uuid
    amount: string;
    paid_at: string; // yyyy-mm-dd
    type_of: EntryType;
    payment_method: PaymentMethod | '';
    billing_account: string;
  }>({
    description: '',
    title: '',
    amount: '',
    paid_at: '',
    type_of: 'income',
    payment_method: '',
    billing_account: '',
  });

  const [billingAccounts, setBillingAccounts] = useState<BillingAccountOption[]>([]);
  const [presets, setPresets] = useState<PresetOption[]>([]);

  const selectedTitle = titles.find((t) => t.uuid === form.title);
  const selectedPreset = presets.find((p) => p.uuid === (selectedTitle as any)?.preset);

  useEffect(() => {
    if (!isOpen) return;
    if (entry?.uuid) {
      // edit mode
      setForm({
        description: entry.description ?? '',
        title: typeof entry.title === 'string' ? entry.title : ((entry.title as any)?.uuid ?? ''),
        amount: entry.amount !== undefined ? String(entry.amount) : '',
        paid_at: entry.paid_at ?? '',
        type_of: (entry.type_of as EntryType) ?? forceType ?? 'income',
        payment_method: entry.payment_method ?? '',
        billing_account: entry.billing_account ?? '',
      });
    } else {
      setForm({
        description: '',
        title: '',
        amount: '',
        paid_at: '',
        type_of: forceType ?? 'income',
        payment_method: '',
        billing_account: '',
      });
    }
  }, [isOpen, entry, forceType]);

  // Carrega contas contábeis e presets quando o modal abre
  useEffect(() => {
    if (!isOpen) return;
    const loadAuxData = async () => {
      try {
        const [accountsRes, presetsRes] = await Promise.all([getBillingAccounts(), getPresets()]);
        setBillingAccounts(accountsRes || []);
        setPresets(presetsRes || []);
      } catch (error) {
        console.error('Erro ao carregar contas/presets para lançamentos', error);
      }
    };
    loadAuxData();
  }, [isOpen]);

  // Sugere conta contábil com base no preset do título
  useEffect(() => {
    if (!isOpen) return;
    if (!form.title || form.billing_account) return;
    if (!selectedTitle || !selectedPreset) return;

    const defaultAccountUuid =
      form.type_of === 'expense' ? selectedPreset.payable_account : selectedPreset.receivable_account;

    if (defaultAccountUuid) {
      setForm((prev) => ({ ...prev, billing_account: defaultAccountUuid as string }));
    }
  }, [isOpen, form.title, form.type_of, form.billing_account, selectedTitle, selectedPreset]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Entry = {
      uuid: (entry?.uuid as string) || '', // consumer may ignore on create
      title: form.title,
      description: form.description.trim(),
      amount: Number(form.amount || 0),
      paid_at: form.paid_at || null,
      type_of: form.type_of,
      payment_method: form.payment_method as PaymentMethod,
      billing_account: form.billing_account || null,
      created_at: (entry?.created_at as string) || new Date().toISOString(),
    };
    onSave(payload, entry?.uuid);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40">
      <div className="max-width-[720px] mx-4 w-full rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            {form.type_of === 'income' ? (
              <TrendingUp className="text-green-600" />
            ) : (
              <TrendingDown className="text-red-600" />
            )}
            <h3 className="text-lg font-semibold">{entry?.uuid ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Resumo do título (não editável) */}
          {selectedTitle && (
            <div className="rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-900">
              <div className="mb-2 flex items-center gap-2">
                <BadgeDollarSign className="text-emerald-600" size={18} />
                <span className="font-semibold">Título selecionado</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Descrição</Label>
                  <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">{selectedTitle.description}</p>
                </div>
                <div>
                  <Label>Valor original</Label>
                  <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(selectedTitle.amount)}
                  </p>
                </div>
                <div>
                  <Label>Vencimento</Label>
                  <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">
                    {selectedTitle.expiration_date
                      ? new Date(selectedTitle.expiration_date).toLocaleDateString('pt-BR')
                      : '—'}
                  </p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p className="mt-1 text-xs text-gray-800 dark:text-gray-200">
                    {form.type_of === 'income' ? 'Receita (Contas a Receber)' : 'Despesa (Contas a Pagar)'}
                  </p>
                </div>
                {selectedPreset && (
                  <div className="md:col-span-2">
                    <Label>Conta sugerida pelo preset</Label>
                    <p className="mt-1 flex items-center gap-2 text-xs text-gray-800 dark:text-gray-200">
                      <Banknote size={14} />
                      {form.type_of === 'expense'
                        ? selectedPreset.payable_name || '—'
                        : selectedPreset.receivable_name || '—'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <TextInput
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="title">Título relacionado *</Label>
            <select
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-md border p-2"
              required
            >
              <option value="">Selecione...</option>
              {titles.map((t) => (
                <option key={t.uuid} value={t.uuid}>
                  {t.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="type_of">Tipo *</Label>
            <select
              id="type_of"
              value={form.type_of}
              onChange={(e) => {
                if (!forceType) {
                  setForm({ ...form, type_of: e.target.value as 'income' | 'expense' });
                }
              }}
              disabled={!!forceType}
              className={`w-full rounded-md p-2 ${forceType ? 'cursor-not-allowed bg-gray-200' : ''}`}
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="payment_method">Método de pagamento *</Label>
              <select
                id="payment_method"
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value as PaymentMethod })}
                className="w-full rounded-md border p-2"
                required
              >
                <option value="">Selecione...</option>
                <option value="cash">Dinheiro</option>
                <option value="debit">Cartão de Débito</option>
                <option value="credit">Cartão de Crédito</option>
                <option value="pix">Pix</option>
              </select>
            </div>

            <div>
              <Label htmlFor="billing_account">Conta contábil (billing account) *</Label>
              <select
                id="billing_account"
                value={form.billing_account}
                onChange={(e) => setForm({ ...form, billing_account: e.target.value })}
                className="w-full rounded-md border p-2"
                required
              >
                <option value="">Selecione...</option>
                {billingAccounts.map((acc) => (
                  <option key={acc.uuid} value={acc.uuid}>
                    {acc.code} - {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Valor *</Label>
            <TextInput
              id="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="paid_at">Data *</Label>
            <TextInput
              id="paid_at"
              type="date"
              value={form.paid_at}
              onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary">
              {entry?.uuid ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
