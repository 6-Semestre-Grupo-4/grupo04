'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput } from 'flowbite-react';

import ToastNotification from '@/components/utils/toastNotification';

import { Title } from '@/types/title';

import { getTitles } from '@/services/titleService';

export default function ReceivableEntriesPage() {
  const router = useRouter();
  const [titles, setTitles] = useState<Title[]>([]);

  const [searchTerm, setSearchTerm] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // === LOAD DATA ============================================================
  const loadData = async () => {
    try {
      const titlesResponse = await getTitles();
      const openIncomeTitles = titlesResponse.filter((t) => t.type_of === 'income' && t.active);
      setTitles(openIncomeTitles);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erro ao carregar dados.', type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // === FILTER ==========================================================
  const filteredTitles = titles.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

  // === RENDER ==========================================================
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-enhanced space-y-6 rounded-xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gradient text-3xl font-bold">Entradas – Contas a Receber</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Registre os recebimentos das suas receitas.</p>
          </div>
        </div>

        {/* SEARCH */}
        <TextInput
          placeholder="Buscar descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96"
        />

        {/* TABLE OF OPEN INCOME TITLES */}
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
                        onClick={() => router.push(`/pages/operations/accounts-receivable/receive/${t.uuid}`)}
                      >
                        Receber
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOAST */}
        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
