'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Modal, Label, TextInput } from 'flowbite-react';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';
import { MdAccountTree } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ToastNotification from '@/components/utils/toastNotification';
import ConfirmDialog from '@/components/utils/confirmDialog';
import { clearBillingAccountsCache } from '@/services/billingAccountSevice';

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
      clearBillingAccountsCache(uuid);
      fetchAccounts();

      setToast({
        message: editingAccount ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!',
        type: 'success',
      });
      clearBillingAccountsCache(uuid);
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
      clearBillingAccountsCache(uuid);
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
        label: `${'  '.repeat(level)}${acc.code} - ${acc.name}`,
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
        <tr key={acc.uuid} className="border-border hover:bg-muted/50 border-b transition-colors">
          <td className="px-6 py-4 font-medium whitespace-nowrap" style={{ paddingLeft }}>
            <div className="flex items-center">
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(acc.uuid)}
                  className="hover:bg-muted mr-2 cursor-pointer rounded-md p-1 transition"
                >
                  {isExpanded ? (
                    <HiOutlineChevronDown size={16} className="text-foreground" />
                  ) : (
                    <HiOutlineChevronRight size={16} className="text-foreground" />
                  )}
                </button>
              ) : (
                <span className="mr-2 w-[24px]" />
              )}

              <MdAccountTree className="text-text-muted mr-2 h-4 w-4" />

              <span className="text-foreground">{acc.name}</span>
            </div>
          </td>

          <td className="text-foreground px-6 py-4">{acc.code || '-'}</td>

          <td className="text-foreground px-6 py-4">{acc.account_type === 'analytic' ? 'Analítica' : 'Sintética'}</td>

          <td className="flex items-center gap-3 px-6 py-4">
            <button
              onClick={() => openEditModal(acc)}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-surface/60 rounded-md p-1 backdrop-blur-sm transition hover:scale-105"
              title="Editar"
            >
              <FiEdit2 size={18} className="text-foreground" />
            </button>

            <button
              onClick={() => confirmDelete(acc.uuid)}
              onMouseDown={(e) => e.stopPropagation()}
              className="bg-surface/60 rounded-md p-1 backdrop-blur-sm transition hover:scale-105"
              title="Excluir"
            >
              <FiTrash2 size={18} className="text-foreground" />
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
    <div className="min-h-screen p-10 transition-all">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold">Plano de Contas</h1>
          <p className="text-text-muted mt-1">Gerencie as contas contábeis deste plano.</p>
        </div>

        <div className="flex gap-3">
          <Button
            color="gray"
            className="bg-muted hover:bg-muted-foreground/20"
            onClick={() => router.push('/pages/settings/billing-plans')}
          >
            Voltar
          </Button>

          <Button
            className="btn-primary shadow-md"
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

      <div className="card-enhanced overflow-x-auto rounded-lg">
        <table className="divide-border w-full divide-y text-sm">
          <thead className="bg-muted text-text-muted text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Conta</th>
              <th className="px-6 py-3 text-left">Classificação</th>
              <th className="px-6 py-3 text-left">Tipo</th>
              <th className="px-6 py-3 text-left">Ações</th>
            </tr>
          </thead>

          <tbody>
            {accounts.length > 0 ? (
              renderRows(accounts, 0)
            ) : (
              <tr>
                <td colSpan={4} className="text-text-muted py-8 text-center">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)} size="lg" popup>
        <div className="bg-surface space-y-4 p-6">
          <h2 className="text-foreground text-xl font-bold">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h2>

          <div>
            <Label className="text-text">Descrição</Label>
            <TextInput
              value={newAccount.name}
              onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-surface border-border text-foreground uppercase"
            />
          </div>

          <div>
            <Label className="text-text">Conta Pai (opcional)</Label>
            <select
              value={newAccount.parentId}
              onChange={(e) => setNewAccount({ ...newAccount, parentId: e.target.value })}
              className="border-border bg-surface text-foreground hover:border-primary focus:border-primary focus:ring-primary/15 w-full rounded-lg border px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
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
            <Label className="text-text">Tipo de Conta</Label>
            <select
              value={newAccount.type_of}
              onChange={(e) => setNewAccount({ ...newAccount, type_of: e.target.value as TypeOfAccount })}
              className="border-border bg-surface text-foreground hover:border-primary focus:border-primary focus:ring-primary/15 w-full rounded-lg border px-3 py-2 transition-colors focus:ring-1 focus:outline-none"
            >
              <option value="">Selecione...</option>
              <option value="Sintética">Sintética</option>
              <option value="Analítica">Analítica</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <Button className="btn-primary shadow-md" onClick={saveAccount}>
              {editingAccount ? 'Salvar Alterações' : 'Salvar'}
            </Button>

            <Button color="gray" className="bg-muted hover:bg-muted-foreground/20" onClick={() => setShowModal(false)}>
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
