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
  const [filterActive, setFilterActive] = useState('all');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // === LOAD DATA ============================================================
  const loadData = async () => {
    try {
      const titlesResponse = await getTitles();

      // Mostra TODOS os títulos de receita (ativos e inativos)
      const openIncomeTitles = titlesResponse.filter((t) => t.type_of === 'income');

      setTitles(openIncomeTitles);
    } catch (err) {
      console.error('❌ Erro ao carregar títulos:', err);
      setToast({ message: 'Erro ao carregar dados.', type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // === FILTER ==========================================================
  const filteredTitles = titles
    .filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((t) => {
      if (filterActive === 'active') return t.active;
      if (filterActive === 'inactive') return !t.active;
      return true; // 'all'
    });

  // === RENDER ==========================================================
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-enhanced space-y-6 rounded-xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gradient text-3xl font-bold">Baixa de Contas a Receber</h1>
            <p className="text-text-muted text-sm">Registre os recebimentos das suas receitas.</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex flex-col gap-4 md:flex-row">
          <TextInput
            placeholder="Buscar descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96"
          />

          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="border-border bg-surface text-text focus:border-primary focus:ring-primary/15 w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-1 focus:outline-none md:w-40"
          >
            <option value="all">Todos</option>
            <option value="active">Em aberto</option>
            <option value="inactive">Quitados</option>
          </select>
        </div>

        {/* TABLE OF OPEN INCOME TITLES */}
        <div className="card-enhanced overflow-x-auto rounded-lg">
          <table className="divide-border w-full divide-y text-sm">
            <thead className="bg-muted text-text text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Título</th>
                <th className="px-6 py-3 text-left">Valor</th>
                <th className="px-6 py-3 text-left">Vencimento</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-center">Ação</th>
              </tr>
            </thead>

            <tbody>
              {filteredTitles.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-text-muted py-8 text-center">
                    Nenhum título cadastrado.
                  </td>
                </tr>
              )}
              {filteredTitles.map((t) => (
                <tr key={t.uuid} className="border-border hover:bg-muted/50 border-b transition-colors">
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                  </td>
                  <td className="px-6 py-4">
                    {t.expiration_date ? new Date(t.expiration_date).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {t.active ? (
                      <span className="bg-warning/10 text-warning border-warning/20 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        Em aberto
                      </span>
                    ) : (
                      <span className="bg-success/10 text-success border-success/20 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium">
                        Quitado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Button
                        color="gray"
                        className="bg-muted hover:bg-muted-foreground/20"
                        onClick={() => router.push(`/pages/operations/accounts-receivable/receive/${t.uuid}`)}
                      >
                        Ver
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
