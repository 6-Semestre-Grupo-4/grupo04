'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, TextInput } from 'flowbite-react';
import { Plus, Edit, Trash2, Check, X, CheckCircle2 } from 'lucide-react';

import ToastNotification from '@/components/utils/toastNotification';
import TitleForm from '@/components/titles/TitleForm';
import ConfirmDialog from '@/components/utils/confirmDialog';

import { Title } from '@/types/title';
import { Company } from '@/types/company';

import { getTitles, saveTitle, deleteTitle, getCompanies } from '@/services/titleService';

// Status badge
const StatusBadge = ({ active }: { active: boolean }) =>
  active ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning border border-warning/20">
      Em aberto
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success border border-success/20">
      Quitado
    </span>
  );

export default function ReceivablesPage() {
  const router = useRouter();
  const [titles, setTitles] = useState<Title[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    uuid?: string;
  } | null>(null);

  // LOAD DATA
  const fetchTitles = async () => {
    try {
      const data = await getTitles();
      setTitles(data);
    } catch {
      setToast({ message: 'Erro ao buscar títulos.', type: 'error' });
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch {
      console.error('Erro ao carregar empresas');
    }
  };

  useEffect(() => {
    fetchTitles();
    fetchCompanies();
  }, []);

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.uuid === companyId);
    return company?.fantasy_name || 'N/A';
  };

  // SAVE
  const handleSave = async (title: Title, uuid?: string) => {
    try {
      await saveTitle({ ...title, type_of: 'income' }, uuid);

      setToast({
        message: uuid ? 'Recebimento atualizado com sucesso!' : 'Recebimento cadastrado com sucesso!',
        type: 'success',
      });

      setShowModal(false);
      setEditingTitle(null);
      fetchTitles();
    } catch {
      setToast({ message: 'Erro ao salvar o recebimento.', type: 'error' });
    }
  };

  // DELETE
  const handleDelete = async () => {
    if (!confirmDialog?.uuid) return;
    try {
      await deleteTitle(confirmDialog.uuid);
      setToast({ message: 'Recebimento excluído com sucesso!', type: 'success' });
      fetchTitles();
    } catch {
      setToast({ message: 'Erro ao excluir o recebimento.', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };

  // FILTER
  const filteredTitles = titles.filter((title) => {
    const matchesSearch = title.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = title.type_of === 'income'; // apenas receitas

    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && title.active) ||
      (filterActive === 'inactive' && !title.active);

    return matchesSearch && matchesType && matchesActive;
  });

  // RENDER
  return (
    <div
      className="container mx-auto min-h-screen px-4 py-8"
      style={{ background: 'var(--background)', color: 'var(--color-text)' }}
    >
      <div className="card-enhanced animate-[fade-in_0.5s_ease-in-out] space-y-6 rounded-xl p-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-gradient mb-2 text-3xl font-bold">Contas a Receber</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Registre e acompanhe todos os valores que sua empresa tem a receber.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingTitle({ type_of: 'income' } as Title);
              setShowModal(true);
            }}
            className="btn-primary flex items-center gap-2 px-6 py-3 font-medium"
          >
            <Plus className="h-5 w-5" />
            Novo Recebimento
          </Button>
        </div>

        {/* Filters */}
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
            className="border-border bg-surface text-muted-foreground focus:border-primary focus:ring-primary/15 w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-1 focus:outline-none md:w-40"
          >
            <option value="all">Todos</option>
            <option value="active">Em aberto</option>
            <option value="inactive">Quitados</option>
          </select>
        </div>

        {/* Table */}
        <div className="card-enhanced overflow-x-auto rounded-lg">
          <table className="divide-border w-full divide-y text-sm">
            <thead className="bg-muted text-text text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Descrição</th>
                <th className="px-6 py-3 text-left">Empresa</th>
                <th className="px-6 py-3 text-left">Valor</th>
                <th className="px-6 py-3 text-left">Vencimento</th>
                <th className="px-6 py-3 text-left">Parcelas</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredTitles.length > 0 ? (
                filteredTitles.map((title) => (
                  <tr key={title.uuid} className="border-border hover:bg-muted/50 border-b transition-colors">
                    <td className="px-6 py-4 font-medium">{title.description}</td>

                    <td className="px-6 py-4">{getCompanyName(title.company as string)}</td>

                    <td className="px-6 py-4">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(title.amount)}
                    </td>

                    <td className="px-6 py-4">{new Date(title.expiration_date).toLocaleDateString('pt-BR')}</td>

                    <td className="px-6 py-4">{title.installments || 'À vista'}</td>

                    <td className="px-6 py-4">
                      <StatusBadge active={title.active} />
                    </td>

                    <td className="flex justify-center gap-3 px-6 py-4">
                      <button
                        onClick={() => {
                          setEditingTitle(title);
                          setShowModal(true);
                        }}
                        className="bg-primary hover:bg-primary-hover rounded-lg p-2 text-white transition-all"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        onClick={() => router.push(`/pages/operations/accounts-receivable/receive/${title.uuid}`)}
                        className="bg-success rounded-lg p-2 text-white transition-all hover:opacity-90"
                        title="Baixar título"
                      >
                        <CheckCircle2 size={16} />
                      </button>

                      <button
                        onClick={() => setConfirmDialog({ show: true, uuid: title.uuid })}
                        className="bg-error rounded-lg p-2 text-white transition-all hover:opacity-90"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-text-muted py-8 text-center">
                    Nenhum recebimento cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Form */}
        <TitleForm
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          title={editingTitle}
          companies={companies}
          typeLocked={true} // TRAVA o tipo para income
        />

        {/* Delete Dialog */}
        {confirmDialog?.show && (
          <ConfirmDialog
            show={confirmDialog.show}
            title="Excluir recebimento"
            message="Tem certeza que deseja excluir este recebimento?"
            confirmText="Excluir"
            cancelText="Cancelar"
            onConfirm={handleDelete}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

        {/* Toast */}
        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
