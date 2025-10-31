'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Modal, Label, TextInput } from 'flowbite-react';
import { HiOutlineChevronRight, HiOutlineChevronDown } from 'react-icons/hi';
import { MdAccountTree } from "react-icons/md";

type TypeOfAccount = 'Sintética' | 'Analítica';
type TypeOfCompany = 'Client' | 'Supplier' | 'Both';

type Address = {
  uuid: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type Company = {
  uuid: string;
  cpnj: string;
  fantasy_name: string;
  social_reason: string;
  opening_date: string;
  logo: string;
  cnae: string;
  address: Address;
  type_of: TypeOfCompany;
  email: string;
  phone: string;
};

type BillingPlan = {
  uuid: string;
  name: string;
  description: string;
};

type BillingAccount = {
  uuid: string;
  name: string;
  billingPlan: BillingPlan;
  type_of: TypeOfAccount;
  classification: string;
  billingAccount_parent?: BillingAccount[];
  company: Company;
};

export default function BillingAccountPage() {
  const { billingPlanId } = useParams<{ billingPlanId: string }>();
  const router = useRouter();

  const [accounts, setAccounts] = useState<BillingAccount[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);

  const [newAccount, setNewAccount] = useState({
    name: '',
    classification: '',
    parentId: '',
    type_of: 'Analítica' as TypeOfAccount,
  });

  const mockCompany: Company = {
    uuid: 'company-001',
    cpnj: '12.345.678/0001-90',
    fantasy_name: 'Empresa Exemplo LTDA',
    social_reason: 'Empresa Exemplo LTDA',
    opening_date: '2020-05-10',
    logo: '',
    cnae: '6201-5/01',
    address: {
      uuid: 'addr-001',
      cep: '01000-000',
      street: 'Rua Exemplo',
      number: '123',
      complement: '',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
    },
    type_of: 'Client',
    email: 'contato@empresa.com',
    phone: '(11) 99999-9999',
  };

  useEffect(() => {
    const mockPlan: BillingPlan = {
      uuid: billingPlanId || 'plan-001',
      name: 'Plano Principal',
      description: 'Plano de contas padrão',
    };

    const mockData: BillingAccount[] = [
      {
        uuid: 'acc-1',
        name: 'ATIVO',
        classification: '1',
        type_of: 'Sintética',
        billingPlan: mockPlan,
        company: mockCompany,
        billingAccount_parent: [
          {
            uuid: 'acc-1-1',
            name: 'Caixa',
            classification: '1.1',
            type_of: 'Analítica',
            billingPlan: mockPlan,
            company: mockCompany,
          },
        ],
      },
    ];
    setAccounts(mockData);
  }, [billingPlanId]);

  const toggleRow = (accountId: string) => {
    setExpandedRows((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(accountId)) newExpanded.delete(accountId);
      else newExpanded.add(accountId);
      return newExpanded;
    });
  };

  const addAccount = () => {
    if (!newAccount.name.trim()) {
      alert('Account name is required.');
      return;
    }

    const accountToAdd: BillingAccount = {
      uuid: crypto.randomUUID(),
      name: newAccount.name,
      classification: newAccount.classification,
      type_of: newAccount.type_of,
      billingPlan: { uuid: billingPlanId, name: '', description: '' },
      billingAccount_parent: [],
      company: mockCompany,
    };

    if (!newAccount.parentId) {
      setAccounts((prev) => [...prev, accountToAdd]);
    } else {
      const addSubAccount = (accountList: BillingAccount[]): BillingAccount[] => {
        return accountList.map((acc) => {
          if (acc.uuid === newAccount.parentId) {
            return {
              ...acc,
              type_of: 'Sintética',
              billingAccount_parent: [...(acc.billingAccount_parent || []), accountToAdd],
            };
          }
          if (acc.billingAccount_parent) {
            return { ...acc, billingAccount_parent: addSubAccount(acc.billingAccount_parent) };
          }
          return acc;
        });
      };
      setAccounts((prev) => addSubAccount(prev));
    }

    setShowModal(false);
    setNewAccount({
      name: '',
      classification: '',
      parentId: '',
      type_of: 'Analítica',
    });
  };

  const generateParentOptions = (accountList: BillingAccount[], level = 0): { uuid: string; label: string }[] => {
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
              <MdAccountTree className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
              {acc.name}
            </div>
          </td>
          <td className="px-6 py-4">{acc.classification}</td>
          <td className="px-6 py-4">{acc.type_of}</td>
        </tr>
      );

      if (isExpanded && acc.billingAccount_parent) {
        rows.push(...renderRows(acc.billingAccount_parent, level + 1));
      }
    });
    return rows;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Plano de Contas</h1>
          <p className="text-gray-500">Gerencie as contas deste plano.</p>
        </div>
        <div className="flex gap-2">
          <Button color="gray" onClick={() => router.push('/pages/billing-plans')}>
            Voltar
          </Button>
          <Button color="blue" onClick={() => setShowModal(true)}>
            Nova Conta
          </Button>
        </div>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Conta</th>
              <th scope="col" className="px-6 py-3">Classificação</th>
              <th scope="col" className="px-6 py-3">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length > 0 ? renderRows(accounts, 0) : (
              <tr>
                <td colSpan={3} className="text-center py-6 text-gray-400">
                  Nenhuma conta cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Nova Conta</h2>

          <div>
            <Label htmlFor="name">Descrição</Label>
            <TextInput
              id="name"
              value={newAccount.name}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, name: e.target.value.toUpperCase().slice(0, 50) }))
              }
              className="uppercase"
              maxLength={50}
            />
          </div>

          <div>
            <Label htmlFor="classification">Classificação</Label>
            <TextInput id="classification" value={newAccount.classification} readOnly />
          </div>

          <div>
            <Label htmlFor="parentId">Conta Pai (opcional)</Label>
            <select
              id="parentId"
              value={newAccount.parentId}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, parentId: e.target.value }))
              }
              className="w-full border rounded px-2 py-1"
            >
              <option value="">Nenhuma (Conta Principal)</option>
              {generateParentOptions(accounts).map((opt) => (
                <option key={opt.uuid} value={opt.uuid}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button color="blue" onClick={addAccount}>Salvar</Button>
            <Button color="gray" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
