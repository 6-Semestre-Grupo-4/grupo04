'use client';

import { useEffect, useState } from 'react';
import { Button, Label, TextInput, Select } from 'flowbite-react';
import { FiArrowRight, FiEdit2, FiTrash2 } from 'react-icons/fi';

import ToastNotification from '@/components/utils/toastNotification';
import HistoryPresetForm from '@/components/billing/historyPreset';

import { Preset } from '@/types/preset';
import { BillingPlan } from '@/types/billingPlan';
import { BillingAccount } from '@/types/billingAccount';
import ConfirmDialog from '@/components/utils/confirmDialog';

import { getPresets, savePreset, deletePreset, getBillingPlans, getAccountsByPlan } from '@/services/presetService';

export default function HistoryPresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [modalAccounts, setModalAccounts] = useState<BillingAccount[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    billing_plan: '',
    payable_account: '',
    receivable_account: '',
  });

  const [filterPlan, setFilterPlan] = useState('');
  const [searchText, setSearchText] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    preset?: Preset;
  } | null>(null);

  // ========== LOAD INITIAL DATA ==========
  useEffect(() => {
    async function fetchData() {
      try {
        const [plansData, presetsData] = await Promise.all([getBillingPlans(), getPresets()]);

        setPlans(plansData);
        setPresets(presetsData);
      } catch {
        setToast({ message: 'Erro ao carregar dados.', type: 'error' });
      }
    }
    fetchData();
  }, []);

  // ========== LOAD ALL ACCOUNTS ==========
  useEffect(() => {
    async function loadAllAccounts() {
      try {
        let all: BillingAccount[] = [];
        const list = await getBillingPlans();

        for (const p of list) {
          const acc = await getAccountsByPlan(p.uuid);
          all = [...all, ...acc];
        }

        setAccounts(all);
      } catch {}
    }
    loadAllAccounts();
  }, []);

  // ========== OPEN FORM ==========
  function openForm(preset?: Preset) {
    if (preset) {
      setEditing(preset);

      setForm({
        name: preset.name ?? '',
        description: preset.description ?? '',
        billing_plan: preset.billing_plan ?? '',
        payable_account: preset.payable_account ?? '',
        receivable_account: preset.receivable_account ?? '',
      });

      getAccountsByPlan(preset.billing_plan ?? '').then(setModalAccounts);
    } else {
      setEditing(null);
      setForm({
        name: '',
        description: '',
        billing_plan: '',
        payable_account: '',
        receivable_account: '',
      });
      setModalAccounts([]);
    }

    setOpenModal(true);
  }

  // ========== SAVE ==========
  async function handleSave() {
    if (!form.name.trim() || !form.billing_plan || !form.payable_account || !form.receivable_account) {
      setToast({ message: 'Preencha todos os campos obrigatórios.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);

      await savePreset(form, editing?.uuid);
      setPresets(await getPresets());

      setToast({
        message: editing ? 'Histórico atualizado!' : 'Histórico criado!',
        type: 'success',
      });

      setOpenModal(false);
    } catch {
      setToast({ message: 'Erro ao salvar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  // ========== DELETE ==========
  async function handleDeleteConfirm() {
    if (!confirmDialog?.preset) return;

    try {
      await deletePreset(confirmDialog.preset.uuid);
      setPresets(await getPresets());
      setToast({ message: 'Histórico excluído!', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao excluir.', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  }

  // ========== FILTER ==========
  const filteredPresets = presets.filter((preset) => {
    const matchPlan = filterPlan ? preset.billing_plan === filterPlan : true;

    const txt = searchText.trim().toLowerCase();
    const matchText = txt
      ? preset.name.toLowerCase().includes(txt) || preset.description.toLowerCase().includes(txt)
      : true;

    return matchPlan && matchText;
  });

  // ========== HELPERS ==========
  function getAccountName(uuid: string | null) {
    if (!uuid) return '—';
    return accounts.find((a) => a.uuid === uuid)?.name ?? '—';
  }

  function getPlanName(uuid: string | null) {
    if (!uuid) return 'Plano não encontrado';
    const plan = plans.find((p) => p.uuid === uuid);
    return plan ? `"${plan.name}"` : 'Plano não encontrado';
  }

  // ========== RENDER ==========
  return (
    <div className="min-h-screen p-10 transition-all">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Históricos Contábeis</h1>
          <p className="mt-1 text-text-muted">
            Configure regras de movimentação entre contas de forma simples e rápida.
          </p>
        </div>

        <Button
          className="btn-primary shadow-md"
          onClick={() => openForm()}
        >
          Novo Histórico
        </Button>
      </div>

      {/* FILTERS */}
      <div className="mb-10 rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Filtros</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* PLANO */}
          <div className="flex flex-col">
            <Label className="mb-1 text-sm text-text">Plano de Contas</Label>

            <Select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="rounded-xl border border-border bg-surface text-foreground"
            >
              <option value="">Todos os planos...</option>
              {plans.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          {/* BUSCA */}
          <div className="flex flex-col">
            <Label className="mb-1 text-sm text-text">Buscar</Label>

            <div className="relative flex items-center rounded-xl border border-border bg-surface">
              <FiArrowRight size={18} className="absolute left-3 text-text-muted" />

              <TextInput
                placeholder="Nome ou descrição..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full bg-transparent pl-10 text-foreground"
              />
            </div>
          </div>

          {/* CLEAR FILTERS */}
          <div className="flex items-end justify-start md:justify-end">
            <Button
              color="gray"
              className="bg-muted hover:bg-muted-foreground/20"
              onClick={() => {
                setFilterPlan('');
                setSearchText('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredPresets.map((h) => (
          <div
            key={h.uuid}
            className="group flex h-full flex-col cursor-pointer rounded-xl border border-border bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4 flex-1">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg leading-tight font-semibold text-text">{h.name}</h2>

                <p className="mt-1 line-clamp-2 text-sm text-text-muted">{h.description}</p>

                <span className="mt-4 inline-block rounded-lg bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                  {getPlanName(h.billing_plan)}
                </span>
              </div>

              <div className="flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100 flex-shrink-0">
                <button
                  onClick={() => openForm(h)}
                  className="rounded-lg bg-muted p-2 shadow-sm transition hover:bg-muted-foreground/20"
                >
                  <FiEdit2 size={16} className="text-foreground" />
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDialog({ show: true, preset: h });
                  }}
                  className="rounded-lg bg-muted p-2 shadow-sm transition hover:bg-muted-foreground/20"
                >
                  <FiTrash2 size={16} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* ACCOUNTS */}
            <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-muted p-4 shadow-inner">
              <span className="flex-1 font-semibold text-red-600 dark:text-red-400 break-words">{getAccountName(h.payable_account)}</span>

              <FiArrowRight size={22} className="text-text-muted flex-shrink-0" />

              <span className="flex-1 font-semibold text-green-600 dark:text-green-400 break-words text-right">
                {getAccountName(h.receivable_account)}
              </span>
            </div>
          </div>
        ))}

        {filteredPresets.length === 0 && (
          <div className="col-span-full py-10 text-center text-text-muted">Nenhum histórico encontrado.</div>
        )}
      </div>

      {/* FORM */}
      <HistoryPresetForm
        show={openModal}
        onClose={() => setOpenModal(false)}
        editing={editing}
        plans={plans}
        modalAccounts={modalAccounts}
        setModalAccounts={setModalAccounts}
        form={form}
        setForm={setForm}
        onSave={handleSave}
        loading={loading}
      />

      {/* CONFIRM DELETE */}
      {confirmDialog?.show && (
        <ConfirmDialog
          show={confirmDialog.show}
          title="Excluir Histórico"
          message={`Tem certeza que deseja excluir o histórico "${confirmDialog.preset?.name}"?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* TOAST */}
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
