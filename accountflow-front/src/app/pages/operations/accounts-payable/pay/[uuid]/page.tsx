'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, TextInput, Label } from 'flowbite-react';
import { ArrowLeft, Save } from 'lucide-react';

import ToastNotification from '@/components/utils/toastNotification';

import { Title } from '@/types/title';
import { Entry, EntryPayload } from '@/types/entry';
import { Preset } from '@/types/preset';
import { BillingAccount } from '@/types/billingAccount';

import { getTitle } from '@/services/titleService';
import { saveEntry } from '@/services/entryService';
import { getPresets } from '@/services/presetService';
import { getBillingAccounts } from '@/services/billingAccountSevice';

export default function PayableEntryPage() {
  const params = useParams();
  const router = useRouter();
  const titleUuid = params.uuid as string;

  const [title, setTitle] = useState<Title | null>(null);
  const [preset, setPreset] = useState<Preset | null>(null);
  const [billingAccounts, setBillingAccounts] = useState<BillingAccount[]>([]);

  const [form, setForm] = useState<{
    description: string;
    amount: string;
    paid_at: string;
    payment_method: 'cash' | 'debit' | 'credit' | 'pix';
    billing_account: string;
  }>({
    description: '',
    amount: '',
    paid_at: new Date().toISOString().slice(0, 10),
    payment_method: 'pix',
    billing_account: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  // === LOAD DATA ============================================================
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Buscar título
        const titleData = await getTitle(titleUuid);
        setTitle(titleData);

        // Pré-preencher valor do título
        setForm((prev) => ({
          ...prev,
          amount: titleData.amount.toString(),
          description: titleData.description,
        }));

        // Buscar preset se existir
        if (titleData.preset) {
          const presets = await getPresets();
          const foundPreset = presets.find((p: Preset) => p.uuid === titleData.preset);
          if (foundPreset) {
            setPreset(foundPreset);
            // Pré-selecionar conta do preset (payable_account)
            if (foundPreset.payable_account) {
              setForm((prev) => ({
                ...prev,
                billing_account: foundPreset.payable_account as string,
              }));
            }
          }
        }

        // Buscar contas contábeis
        if (titleData.preset) {
          const presets = await getPresets();
          const foundPreset = presets.find((p: Preset) => p.uuid === titleData.preset);
          if (foundPreset?.billing_plan) {
            const accounts = await getBillingAccounts(foundPreset.billing_plan);
            setBillingAccounts(accounts.filter((acc: BillingAccount) => acc.account_type === 'analytic'));
          }
        } else {
          // Se não tem preset, buscar todas as contas (pode precisar de ajuste)
          const allPresets = await getPresets();
          if (allPresets.length > 0 && allPresets[0].billing_plan) {
            const accounts = await getBillingAccounts(allPresets[0].billing_plan);
            setBillingAccounts(accounts.filter((acc: BillingAccount) => acc.account_type === 'analytic'));
          }
        }
      } catch (err) {
        console.error(err);
        setToast({ message: 'Erro ao carregar dados do título.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (titleUuid) {
      loadData();
    }
  }, [titleUuid]);

  // === SAVE ============================================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (!form.billing_account) {
      setToast({
        message: 'Selecione uma conta financeira antes de salvar.',
        type: 'error',
      });
      return;
    }

    try {
      setSaving(true);

      const payload: EntryPayload = {
        title: titleUuid,
        description: form.description.trim(),
        amount: Number(form.amount || 0),
        paid_at: form.paid_at,
        type_of: 'expense',
        payment_method: form.payment_method,
        billing_account: form.billing_account,
      };

      await saveEntry(titleUuid, payload);

      setToast({ message: 'Pagamento registrado com sucesso!', type: 'success' });

      // Redirecionar após 1.5s
      setTimeout(() => {
        router.push('/pages/operations/accounts-payable/pay');
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erro ao registrar pagamento.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="container mx-auto min-h-screen px-4 py-8"
        style={{ background: 'var(--background)', color: 'var(--color-text)' }}
      >
        <div className="card-enhanced animate-[fade-in_0.5s_ease-in-out] space-y-6 rounded-xl p-6">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!title) {
    return (
      <div
        className="container mx-auto min-h-screen px-4 py-8"
        style={{ background: 'var(--background)', color: 'var(--color-text)' }}
      >
        <div className="card-enhanced animate-[fade-in_0.5s_ease-in-out] space-y-6 rounded-xl p-6">
          <p>Título não encontrado.</p>
          <Button onClick={() => router.back()}>Voltar</Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto min-h-screen px-4 py-8"
      style={{ background: 'var(--background)', color: 'var(--color-text)' }}
    >
      <div className="card-enhanced animate-[fade-in_0.5s_ease-in-out] space-y-6 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-lg p-2 transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-gradient mb-2 text-3xl font-bold">Baixar Título - Contas a Pagar</h1>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Registre o pagamento para este título.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Informações do Título (Somente Leitura) */}
          <div className="card-enhanced space-y-4 rounded-lg p-6">
            <h2 className="text-xl font-semibold">Informações do Título</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Descrição</Label>
                <TextInput value={title.description} disabled className="rounded-lg bg-gray-100 dark:bg-gray-700" />
              </div>

              <div>
                <Label>Valor Original</Label>
                <TextInput
                  value={new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(title.amount)}
                  disabled
                  className="rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <Label>Data de Vencimento</Label>
                <TextInput
                  value={new Date(title.expiration_date).toLocaleDateString('pt-BR')}
                  disabled
                  className="rounded-lg bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <TextInput value="Despesa" disabled className="rounded-lg bg-gray-100 dark:bg-gray-700" />
              </div>

              {preset && (
                <>
                  <div>
                    <Label>Preset</Label>
                    <TextInput value={preset.name} disabled className="rounded-lg bg-gray-100 dark:bg-gray-700" />
                  </div>

                  <div>
                    <Label>Conta Contábil (Preset)</Label>
                    <TextInput
                      value={preset.payable_account_name || 'N/A'}
                      disabled
                      className="rounded-lg bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dados do Pagamento (Editáveis) */}
          <div className="card-enhanced space-y-4 rounded-lg p-6">
            <h2 className="text-xl font-semibold">Dados do Pagamento</h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                <Label htmlFor="paid_at">Data de Pagamento *</Label>
                <TextInput
                  id="paid_at"
                  type="date"
                  value={form.paid_at}
                  onChange={(e) => setForm({ ...form, paid_at: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="payment_method">Método de Pagamento *</Label>
                <select
                  id="payment_method"
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({ ...form, payment_method: e.target.value as 'cash' | 'debit' | 'credit' | 'pix' })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                  required
                >
                  <option value="pix">Pix</option>
                  <option value="cash">Dinheiro</option>
                  <option value="debit">Cartão de Débito</option>
                  <option value="credit">Cartão de Crédito</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="billing_account">Conta Contábil *</Label>
                <select
                  id="billing_account"
                  value={form.billing_account}
                  onChange={(e) => setForm({ ...form, billing_account: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2.5 dark:border-gray-600 dark:bg-gray-700"
                  required
                >
                  <option value="">Selecione uma conta...</option>
                  {billingAccounts.map((acc) => (
                    <option key={acc.uuid} value={acc.uuid}>
                      {acc.code} - {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button type="button" color="gray" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save size={18} />
              {saving ? 'Salvando...' : 'Registrar Pagamento'}
            </Button>
          </div>
        </form>

        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
