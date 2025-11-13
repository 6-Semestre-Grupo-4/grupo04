'use client';
import { useState } from 'react';
import { Button, Badge, TextInput, Select } from 'flowbite-react';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { CreateEntryModal } from '@/components/entries/CreateEntryModal';

interface Entry {
  uuid: string;
  title: string;
  description: string;
  type_of: 'Income' | 'Expense';
  amount: number;
  date: string;
}

const mockEntries: Entry[] = [
  {
    uuid: '1',
    title: 'title-001',
    description: 'Pagamento de cliente',
    type_of: 'Income',
    amount: 1500.0,
    date: '2025-01-15',
  },
  {
    uuid: '2',
    title: 'title-002',
    description: 'Compra de material',
    type_of: 'Expense',
    amount: 350.75,
    date: '2025-01-14',
  },
  {
    uuid: '3',
    title: 'title-003',
    description: 'Venda de produto',
    type_of: 'Income',
    amount: 2200.0,
    date: '2025-01-13',
  },
];

const mockTitles = [
  { uuid: 'title-001', description: 'Pagamento de serviços' },
  { uuid: 'title-002', description: 'Fornecedor XYZ' },
  { uuid: 'title-003', description: 'Consultoria técnica' },
];

const getTypeBadge = (type: string) => {
  return type === 'Income' ? <Badge color="success">Receita</Badge> : <Badge color="failure">Despesa</Badge>;
};

export default function EntriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const filteredEntries = mockEntries.filter((entry) => {
    const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entry.type_of === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="container mx-auto px-4">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Lançamentos</h1>

        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex flex-1 gap-4">
            <div className="w-full md:w-96">
              <TextInput
                icon={HiSearch}
                placeholder="Buscar por descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-40">
              <option value="all">Todos os Tipos</option>
              <option value="Income">Receitas</option>
              <option value="Expense">Despesas</option>
            </Select>
          </div>

          <Button color="blue" onClick={() => setCreateModalOpen(true)}>
            <HiPlus className="mr-2 h-5 w-5" />
            Novo Lançamento
          </Button>

          <CreateEntryModal
            isOpen={isCreateModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSave={(entry) => {
              console.log('Novo lançamento:', entry);
              setCreateModalOpen(false);
            }}
            titles={mockTitles}
          />
        </div>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Descrição
                </th>
                <th scope="col" className="px-6 py-3">
                  Tipo
                </th>
                <th scope="col" className="px-6 py-3">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3">
                  Data
                </th>
                <th scope="col" className="px-6 py-3">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((entry) => (
                <tr
                  key={entry.uuid}
                  className="border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
                >
                  <td className="px-6 py-4">{entry.description}</td>
                  <td className="px-6 py-4">{getTypeBadge(entry.type_of)}</td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(entry.amount)}
                  </td>
                  <td className="px-6 py-4">{new Date(entry.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Button size="xs" color="light" onClick={() => {}}>
                        Editar
                      </Button>
                      <Button size="xs" color="failure" onClick={() => {}}>
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
