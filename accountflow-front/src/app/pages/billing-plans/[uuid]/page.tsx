'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Modal, Label, TextInput } from 'flowbite-react';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';
import { MdAccountTree } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ToastNotification from '@/components/toastNotification';
import ConfirmDialog from '@/components/billing/confirmDialog';

import { getBillingAccounts, saveBillingAccount, deleteBillingAccount } from '@/services/billingAccountSevice';

type TypeOfAccount = 'Sintética' | 'Analítica' | '';

type BillingAccount = {
  uuid: string;
  name: string;
  account_type: 'analytic' | 'synthetic' | null;
  code: string;
  parent: string | null;
  billingAccount_parent?: BillingAccount[];
  billing_plan: string;
};

export default function BillingAccountPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const router = useRouter();

  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BillingAccount | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; accountId?: string } | null>(null);

  const [newAccount, setNewAccount] = useState({
    name: '',
    parentId: '',
    type_of: '' as TypeOfAccount,
  });

  const fetchAccounts = async () => {
    if (!uuid) return;
    try {
      const data: BillingAccount[] = await getBillingAccounts(uuid);
      setAccounts(buildTree(data));
    } catch {
      setToast({ message: 'Erro ao carregar contas.', type: 'error' });
    }
  };

  useEffect(() => {
    if (uuid) fetchAccounts();
  }, [uuid]);

  const buildTree = (flatList: BillingAccount[]): BillingAccount[] => {
    const map: Record<string, BillingAccount> = {};
    const roots: BillingAccount[] = [];

    flatList.forEach((item) => {
      map[item.uuid] = { ...item, billingAccount_parent: [] };
    });

    flatList.forEach((item) => {
      if (item.parent) {
        map[item.parent]?.billingAccount_parent?.push(map[item.uuid]);
      } else {
        roots.push(map[item.uuid]);
      }
    });

    return roots;
  };

  const toggleRow = (accountId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      newExpanded.has(accountId) ? newExpanded.delete(accountId) : newExpanded.add(accountId);
      return newExpanded;
    });
  };

  const saveAccount = async () => {
    if (!newAccount.name.trim() || !newAccount.type_of) {
      setToast({ message: 'Preencha todos os campos obrigatórios.', type: 'warning' });
      return;
    }

    const payload = {
      name: newAccount.name.trim(),
      account_type: (newAccount.type_of === 'Analítica' ? 'analytic' : 'synthetic') as 'analytic' | 'synthetic',
      parent: newAccount.parentId || null,
      billing_plan: uuid,
    };

    try {
      if (editingAccount) {
        await saveBillingAccount(payload, editingAccount.uuid);
      } else {
        await saveBillingAccount(payload);
      }

      setShowModal(false);
      setEditingAccount(null);
      setNewAccount({ name: '', parentId: '', type_of: '' });
      fetchAccounts();

      setToast({
        message: editingAccount ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!',
        type: 'success',
      });
    } catch {
      setToast({ message: 'Erro ao salvar a conta.', type: 'error' });
    }
  };

  const confirmDelete = (accountId: string) => {
    setConfirmDialog({ show: true, accountId });
  };

  const handleDelete = async () => {
    if (!confirmDialog?.accountId) return;

    try {
      await deleteBillingAccount(confirmDialog.accountId);
      fetchAccounts();
      setToast({ message: 'Conta excluída com sucesso!', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao excluir a conta.', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };

  const openEditModal = (account: BillingAccount) => {
    setEditingAccount(account);
    setNewAccount({
      name: account.name,
      parentId: account.parent || '',
      type_of:
        account.account_type === 'analytic' ? 'Analítica' : account.account_type === 'synthetic' ? 'Sintética' : '',
    });
    setShowModal(true);
  };

  const generateParentOptions = (list: BillingAccount[], level = 0): { uuid: string; label: string }[] => {
    let options: any[] = [];

    list.forEach((acc) => {
      options.push({
        uuid: acc.uuid,
        label: `${'— '.repeat(level)}${acc.name}`,
      });

      if (acc.billingAccount_parent?.length) {
        options.push(...generateParentOptions(acc.billingAccount_parent, level + 1));
      }
    });

    return options;
  };

  const renderRows = (accountList: BillingAccount[], level: number): React.ReactNode[] => {
    const rows: React.ReactNode[] = [];

    accountList.forEach((acc) => {
      const isExpanded = expandedRows.has(acc.uuid);
      const hasChildren = acc.billingAccount_parent?.length;
      const paddingLeft = level * 28 + 16;

      rows.push(
        <tr
          key={acc.uuid}
          className="group bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition"
        >
          <td
            className="px-6 py-4 font-medium whitespace-nowrap text-gray-800 dark:text-gray-100"
            style={{ paddingLeft }}
          >
            <div className="flex items-center">
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(acc.uuid)}
                  className="
                    mr-2 p-1 
                    rounded-md 
                    hover:bg-gray-200 dark:hover:bg-gray-700
                    transition
                  "
                >
                  {isExpanded ? <HiOutlineChevronDown size={16} /> : <HiOutlineChevronRight size={16} />}
                </button>
              ) : (
                <span className="mr-2 w-[24px]" />
              )}

              <MdAccountTree className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />

              {acc.name}
            </div>
          </td>

          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{acc.code || '-'}</td>

          <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
            {acc.account_type === 'analytic' ? 'Analítica' : 'Sintética'}
          </td>

          <td className="px-6 py-4 flex gap-3 items-center">
            <button
              onClick={() => openEditModal(acc)}
              onMouseDown={(e) => e.stopPropagation()}
              className="
      p-1 bg-white/60 dark:bg-gray-700/50 
      rounded-md shadow-sm 
      hover:bg-white dark:hover:bg-gray-600
      hover:scale-105 transition
    "
              title="Editar"
            >
              <FiEdit2 size={18} />
            </button>

            <button
              onClick={() => confirmDelete(acc.uuid)}
              onMouseDown={(e) => e.stopPropagation()}
              className="
      p-1 bg-white/60 dark:bg-gray-700/50 
      rounded-md shadow-sm 
      hover:bg-white dark:hover:bg-gray-600
      hover:scale-105 transition
    "
              title="Excluir"
            >
              <FiTrash2 size={18} />
            </button>
          </td>
        </tr>
      );

      if (isExpanded && acc.billingAccount_parent) {
        rows.push(...renderRows(acc.billingAccount_parent, level + 1));
      }
    });

    return rows;
  };

  return (
    <div className="p-10 min-h-screen transition-all">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Plano de Contas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie as contas contábeis deste plano.</p>
        </div>

        <div className="flex gap-3">
          <Button
            className="
              bg-gray-200 hover:bg-gray-300 
              dark:bg-gray-700 dark:hover:bg-gray-600 
              text-gray-800 dark:text-gray-200
              shadow-sm
            "
            onClick={() => router.push('/pages/billing-plans')}
          >
            Voltar
          </Button>

          <Button
            className="
              bg-gray-900 hover:bg-black 
              dark:bg-gray-800 dark:hover:bg-gray-700 
              text-white shadow-md
            "
            onClick={() => {
              setEditingAccount(null);
              setNewAccount({ name: '', parentId: '', type_of: '' });
              setShowModal(true);
            }}
          >
            Nova Conta
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md border border-gray-200 dark:border-gray-700 rounded-xl">
        <table className="w-full text-sm text-left">
          <thead className="text-xs font-semibold uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <tr>
              <th className="px-6 py-3">Conta</th>
              <th className="px-6 py-3">Classificação</th>
              <th className="px-6 py-3">Tipo</th>
              <th className="px-6 py-3">Ações</th>
            </tr>
          </thead>

          <tbody>
            {accounts.length > 0 ? (
              renderRows(accounts, 0)
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400 dark:text-gray-500">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg" popup>
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl space-y-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingAccount ? 'Editar Conta' : 'Nova Conta'}
          </h2>

          <div>
            <Label>Descrição</Label>
            <TextInput
              value={newAccount.name}
              onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))}
              className="uppercase"
            />
          </div>

          <div>
            <Label>Conta Pai (opcional)</Label>
            <select
              value={newAccount.parentId}
              onChange={(e) => setNewAccount({ ...newAccount, parentId: e.target.value })}
              className="
                w-full border rounded-lg p-2 
                bg-gray-50 dark:bg-gray-900 
                dark:border-gray-700
              "
            >
              <option value="">Nenhuma (Conta Principal)</option>
              {generateParentOptions(accounts).map((opt) => (
                <option key={opt.uuid} value={opt.uuid}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Tipo de Conta</Label>
            <select
              value={newAccount.type_of}
              onChange={(e) => setNewAccount({ ...newAccount, type_of: e.target.value as TypeOfAccount })}
              className="
                w-full border rounded-lg p-2 
                bg-gray-50 dark:bg-gray-900 
                dark:border-gray-700
              "
            >
              <option value="">Selecione...</option>
              <option value="Sintética">Sintética</option>
              <option value="Analítica">Analítica</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              className="
                bg-gray-900 hover:bg-black 
                dark:bg-gray-700 dark:hover:bg-gray-600 
                text-white shadow-md
              "
              onClick={saveAccount}
            >
              {editingAccount ? 'Salvar Alterações' : 'Salvar'}
            </Button>

            <Button
              className="
                bg-gray-200 hover:bg-gray-300 
                dark:bg-gray-700 dark:hover:bg-gray-600 
                text-gray-800 dark:text-gray-200
              "
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {confirmDialog?.show && (
        <ConfirmDialog
          show={confirmDialog.show}
          title="Excluir Conta Contábil"
          message="Tem certeza que deseja excluir esta conta? Esta ação não poderá ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
