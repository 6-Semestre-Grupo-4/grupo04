'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput } from 'flowbite-react';
import { Check } from 'lucide-react';

import ToastNotification from '@/components/toastNotification';

import { Title } from '@/types/title';

import { getTitles } from '@/services/titleService';

const TypeBadge = () => (
  <span className="status-badge status-inactive flex items-center gap-1">
    <Check size={14} /> Pagamento
  </span>
);

export default function PayableEntriesPage() {
  const router = useRouter();
  const [titles, setTitles] = useState<Title[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const loadData = async () => {
    try {
      const allTitles = await getTitles();
      const openExpenseTitles = allTitles.filter((t) => t.type_of === 'expense' && t.active);
      setTitles(openExpenseTitles);
    } catch {
      setToast({ message: 'Erro ao carregar dados.', type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTitles = titles.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-enhanced space-y-6 rounded-xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gradient text-3xl font-bold">Entradas – Contas a Pagar</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Registre pagamentos realizados para suas despesas.
            </p>
          </div>
        </div>

        {/* BUSCA */}
        <TextInput
          placeholder="Buscar descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96"
        />

        {/* TABELA DE TÍTULOS EM ABERTO */}
        <div className="card-enhanced overflow-x-auto rounded-lg">
          <table className="w-full divide-y divide-gray-200 text-sm dark:divide-gray-700">
            <thead className="bg-gray-100 text-xs text-gray-600 uppercase dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-6 py-3">Título</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Vencimento</th>
                <th className="px-6 py-3 text-center">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTitles.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nenhum título em aberto.
                  </td>
                </tr>
              )}
              {filteredTitles.map((t) => (
                <tr key={t.uuid} className="border-b dark:border-gray-700">
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {t.expiration_date ? new Date(t.expiration_date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Button
                        className="btn-primary flex gap-2"
                        onClick={() => router.push(`/pages/operations/accounts-payable/pay/${t.uuid}`)}
                      >
                        <Check size={16} /> Baixar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
