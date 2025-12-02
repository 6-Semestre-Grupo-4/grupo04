'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput } from 'flowbite-react';
import { Check } from 'lucide-react';

import ToastNotification from '@/components/utils/toastNotification';

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
  const [filterActive, setFilterActive] = useState('all');

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const loadData = async () => {
    try {
      const allTitles = await getTitles();
      const openExpenseTitles = allTitles.filter((t) => t.type_of === 'expense');
      setTitles(openExpenseTitles);
    } catch {
      setToast({ message: 'Erro ao carregar dados.', type: 'error' });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTitles = titles
    .filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((t) => {
      if (filterActive === 'active') return t.active;
      if (filterActive === 'inactive') return !t.active;
      return true; // 'all'
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="card-enhanced space-y-6 rounded-xl p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gradient text-3xl font-bold">Baixa de contas a pagar</h1>
            <p className="text-sm text-text-muted">Registre pagamentos realizados para suas despesas.</p>
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

        {/* TABELA DE TÍTULOS EM ABERTO */}
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
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning border border-warning/20">
                        Em aberto
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success border border-success/20">
                        Quitado
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <Button
                        color="gray"
                        className="bg-muted hover:bg-muted-foreground/20"
                        onClick={() => router.push(`/pages/operations/accounts-payable/pay/${t.uuid}`)}
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

        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
