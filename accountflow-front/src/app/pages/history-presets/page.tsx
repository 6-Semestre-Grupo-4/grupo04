'use client';

import { useEffect, useState } from 'react';
import { Modal, Button, Label, TextInput, Select } from 'flowbite-react';
import { HiPlus } from 'react-icons/hi';
import { FiEdit2, FiArrowRight, FiTrash2 } from 'react-icons/fi';
import { getPresets, savePreset, getBillingPlans, getAccountsByPlan, deletePreset } from '@/services/presetService';
import { Preset } from '@/types/preset';
import ToastNotification from '@/components/toastNotification';

interface BillingPlan {
  uuid: string;
  name: string;
  description: string;
}

interface BillingAccount {
  uuid: string;
  name: string;
  code: string;
}

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

  useEffect(() => {
    async function loadAllAccounts() {
      try {
        const allPlans = await getBillingPlans();
        let allAccs: BillingAccount[] = [];

        for (const p of allPlans) {
          const planAccs = await getAccountsByPlan(p.uuid);
          allAccs = [...allAccs, ...planAccs];
        }

        const unique = Array.from(new Map(allAccs.map((acc) => [acc.uuid, acc])).values());
        setAccounts(unique);
      } catch {}
    }
    loadAllAccounts();
  }, []);

  const filteredPresets = presets.filter((preset) => {
    const planMatch = filterPlan ? preset.billing_plan === filterPlan : true;

    const search = searchText.trim().toLowerCase();
    const searchMatch = search
      ? preset.name.toLowerCase().includes(search) || preset.description.toLowerCase().includes(search)
      : true;

    return planMatch && searchMatch;
  });

  async function handleOpenModal(preset?: Preset) {
    if (preset) {
      setEditing(preset);
      setForm({
        name: preset.name,
        description: preset.description,
        billing_plan: preset.billing_plan,
        payable_account: preset.payable_account,
        receivable_account: preset.receivable_account,
      });

      const data = await getAccountsByPlan(preset.billing_plan);
      setModalAccounts(data);
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

  async function handleSave() {
    if (!form.name.trim() || !form.billing_plan || !form.payable_account || !form.receivable_account) {
      setToast({ message: 'Preencha todos os campos obrigatórios.', type: 'warning' });
      return;
    }

    try {
      setLoading(true);
      await savePreset(form, editing?.uuid);

      setPresets(await getPresets());
      setToast({ message: editing ? 'Histórico atualizado!' : 'Histórico criado!', type: 'success' });

      setOpenModal(false);
    } catch {
      setToast({ message: 'Erro ao salvar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(preset: Preset) {
    if (!confirm(`Excluir o histórico "${preset.name}"?`)) return;

    try {
      await deletePreset(preset.uuid);
      setPresets(await getPresets());
      setToast({ message: 'Histórico excluído!', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao excluir.', type: 'error' });
    }
  }

  function getAccountName(preset: Preset, uuid: string, type: 'payable' | 'receivable') {
    return (
      accounts.find((a) => a.uuid === uuid)?.name || (type === 'payable' ? preset.payable_name : preset.receivable_name)
    );
  }

  return (
    <div className="p-10 min-h-screen transition-all">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Históricos Contábeis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Configure regras de movimentação entre contas de forma simples e rápida.
          </p>
        </div>

        <Button
          className="bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white shadow-md transition-all"
          onClick={() => handleOpenModal()}
        >
          Novo Histórico
        </Button>
      </div>

      <div className="mb-10 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Filtros</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <Label className="mb-1 text-gray-600 dark:text-gray-400 text-sm">Plano de Contas</Label>
            <Select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="">Todos os planos...</option>
              {plans.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col">
            <Label className="mb-1 text-gray-600 dark:text-gray-400 text-sm">Buscar</Label>

            <div className="relative flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700">
              <FiArrowRight size={18} className="absolute left-3 text-gray-400 dark:text-gray-500" />

              <TextInput
                placeholder="Nome ou descrição..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 bg-transparent text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          <div className="flex items-end justify-start md:justify-end">
            <Button
              className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-200 shadow-sm"
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPresets.map((h) => (
          <div
            key={h.uuid}
            className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{h.name}</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{h.description}</p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleOpenModal(h)}
                  className="p-1 bg-white/60 dark:bg-gray-700/50 rounded-md shadow-sm hover:scale-105 transition"
                >
                  <FiEdit2 size={18} />
                </button>

                <button
                  onClick={() => handleDelete(h)}
                  className="p-1 bg-white/60 dark:bg-gray-700/50 rounded-md shadow-sm hover:scale-105 transition"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
              <span className="font-semibold text-red-600 dark:text-red-300">
                {getAccountName(h, h.payable_account, 'payable')}
              </span>

              <FiArrowRight size={22} className="text-gray-500 dark:text-gray-300 mx-3" />

              <span className="font-semibold text-green-600 dark:text-green-300">
                {getAccountName(h, h.receivable_account, 'receivable')}
              </span>
            </div>
          </div>
        ))}

        {filteredPresets.length === 0 && (
          <div className="text-center col-span-full text-gray-400 py-10">Nenhum histórico encontrado.</div>
        )}
      </div>

      <Modal show={openModal} size="lg" onClose={() => setOpenModal(false)} popup>
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl space-y-5">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editing ? 'Editar Histórico' : 'Novo Histórico'}
          </h3>

          <div className="grid gap-5">
            <div>
              <Label>Nome</Label>
              <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            <div>
              <Label>Descrição</Label>
              <TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <Label>Plano de Contas</Label>
              <Select
                value={form.billing_plan}
                onChange={async (e) => {
                  const planUUID = e.target.value;

                  setForm({
                    ...form,
                    billing_plan: planUUID,
                    payable_account: '',
                    receivable_account: '',
                  });

                  if (planUUID) {
                    const data = await getAccountsByPlan(planUUID);
                    setModalAccounts(data);
                  } else {
                    setModalAccounts([]);
                  }
                }}
              >
                <option value="">Selecione...</option>
                {plans.map((p) => (
                  <option key={p.uuid} value={p.uuid}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>

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

          <div className="flex justify-end gap-3 pt-4">
            <Button color="gray" onClick={() => setOpenModal(false)}>
              Cancelar
            </Button>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gray-900 hover:bg-black dark:bg-gray-700 dark:hover:bg-gray-600 text-white shadow-md"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
