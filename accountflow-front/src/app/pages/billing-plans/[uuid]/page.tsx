'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Modal, Label, TextInput } from 'flowbite-react';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';
import { MdAccountTree } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ToastNotification from '@/components/billing/toastNotification';
import ConfirmDialog from '@/components/billing/confirmDialog';
// ALTERADO: Importar todas as funções necessárias do serviço
import { getBillingAccounts, saveBillingAccount, deleteBillingAccount } from '@/services/billingAccountSevice';

type TypeOfAccount = 'Sintética' | 'Analítica' | '';

type BillingAccount = {
  uuid: string;
  name: string;
  account_type: 'analytic' | 'synthetic' | null;
  code: string;
  parent: string | null;
  billingAccount_parent?: BillingAccount[];
  company: string;
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
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erro ao carregar contas.', type: 'error' });
    }
  };

  useEffect(() => {
    if (uuid) fetchAccounts();
  }, [uuid]);

  const buildTree = (flatList: BillingAccount[]): BillingAccount[] => {
    // ... (Sua função buildTree está correta, sem alterações) ...
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
      setNewAccount({ name: '', parentId: '', type_of: '', company: newAccount.company });
      fetchAccounts(); // Recarrega os dados
      setToast({
        message: editingAccount ? 'Conta atualizada com sucesso!' : 'Conta cadastrada com sucesso!',
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erro ao salvar a conta.', type: 'error' });
    }
  };

  const confirmDelete = (accountId: string) => {
    setConfirmDialog({ show: true, accountId });
  };

  // ALTERADO: handleDelete agora usa 'deleteBillingAccount' do serviço
  const handleDelete = async () => {
    if (!confirmDialog?.accountId) return;
    try {
      // Usa a função do serviço (axios) que já envia o token
      await deleteBillingAccount(confirmDialog.accountId);

      fetchAccounts(); // Recarrega os dados
      setToast({ message: 'Conta excluída com sucesso!', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erro ao excluir a conta.', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };

  const openEditModal = (account: BillingAccount) => {
    // ... (Sua função openEditModal está correta, sem alterações) ...
    setEditingAccount(account);
    setNewAccount({
      name: account.name,
      parentId: account.parent || '',
      type_of:
        account.account_type === 'analytic' ? 'Analítica' : account.account_type === 'synthetic' ? 'Sintética' : '',
      company: account.company,
    });
    setShowModal(true);
  };

  const generateParentOptions = (accountList: BillingAccount[], level = 0): { uuid: string; label: string }[] => {
    // ... (Sua função generateParentOptions está correta, sem alterações) ...
    let options: { uuid: string; label: string }[] = [];
    accountList.forEach((acc) => {
      options.push({ uuid: acc.uuid, label: `${'--'.repeat(level)} ${acc.name}` });
      if (acc.billingAccount_parent && acc.billingAccount_parent.length > 0) {
        options = [...options, ...generateParentOptions(acc.billingAccount_parent, level + 1)];
      }
    });
    return options;
  };

  const renderRows = (accountList: BillingAccount[], level: number): React.ReactNode[] => {
    // ... (Sua função renderRows está correta, sem alterações) ...
    const rows: React.ReactNode[] = [];
    accountList.forEach((acc) => {
      const isExpanded = expandedRows.has(acc.uuid);
      const hasChildren = acc.billingAccount_parent && acc.billingAccount_parent.length > 0;
      const paddingLeft = level * 24 + 16;

      rows.push(
        <tr key={acc.uuid} className="bg-white border-b hover:bg-gray-50">
          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" style={{ paddingLeft }}>
            <div className="flex items-center">
              {hasChildren ? (
                <button onClick={() => toggleRow(acc.uuid)} className="mr-2 p-1 rounded-full hover:bg-gray-100">
                  {isExpanded ? <HiOutlineChevronDown size={16} /> : <HiOutlineChevronRight size={16} />}
                </button>
              ) : (
                <span className="w-[24px] mr-2" />
              )}
              <MdAccountTree className="w-4 h-4 mr-2 text-gray-500" />
              {acc.name}
            </div>
          </td>
          <td className="px-6 py-4">{acc.code || '-'}</td>
          <td className="px-6 py-4">
            {acc.account_type === 'analytic' ? 'Analítica' : acc.account_type === 'synthetic' ? 'Sintética' : '-'}
          </td>
          <td className="px-6 py-4 flex gap-3">
            <button onClick={() => openEditModal(acc)} className="text-primary hover:text-primary-900 cursor-pointer">
              <FiEdit2 size={16} />
            </button>
            <button onClick={() => confirmDelete(acc.uuid)} className="text-red-600 hover:text-red-800 cursor-pointer">
              <FiTrash2 size={16} />
            </button>
          </td>
        </tr>,
      );

      if (isExpanded && acc.billingAccount_parent) {
        rows.push(...renderRows(acc.billingAccount_parent, level + 1));
      }
    });
    return rows;
  };

  return (
    // ... (Todo o seu JSX está correto, sem alterações) ...
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Plano de Contas</h1>
          <p className="text-gray-500">Gerencie as contas deste plano.</p>
        </div>
        <div className="flex gap-2">
          <Button
            className="cursor-pointer bg-gray-200 hover:bg-gray-100 text-gray-700"
            onClick={() => router.push('/pages/billing-plans')}
          >
            Voltar
          </Button>
          <Button
            className="bg-[#0b2034] hover:bg-[#12314d] cursor-pointer"
            onClick={() => {
              setEditingAccount(null);
              setNewAccount({ name: '', parentId: '', type_of: '', company: 'company-001' }); // Resetar o formulário
              setShowModal(true);
            }}
          >
            Nova Conta
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
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
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{editingAccount ? 'Editar Conta' : 'Nova Conta'}</h2>

          <div>
            <Label htmlFor="name">Descrição</Label>
            <TextInput
              id="name"
              value={newAccount.name}
              onChange={(e) => setNewAccount((prev) => ({ ...prev, name: e.target.value.toUpperCase() }))}
            />
          </div>

          <div>
            <Label htmlFor="parentId">Conta Pai (opcional)</Label>
            <select
              id="parentId"
              value={newAccount.parentId}
              onChange={(e) => setNewAccount((prev) => ({ ...prev, parentId: e.target.value }))}
              className="w-full border rounded px-2 py-1"
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
            <Label htmlFor="type_of">Tipo de Conta</Label>
            <select
              id="type_of"
              value={newAccount.type_of}
              onChange={(e) => setNewAccount((prev) => ({ ...prev, type_of: e.target.value as TypeOfAccount }))}
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Selecione...</option>
              <option value="Sintética">Sintética</option>
              <option value="Analítica">Analítica</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button className="bg-[#0b2034] hover:bg-[#12314d] text-white cursor-pointer" onClick={saveAccount}>
              {editingAccount ? 'Salvar Alterações' : 'Salvar'}
            </Button>
            <Button
              className="bg-gray-200 hover:bg-gray-100 text-gray-700 cursor-pointer"
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