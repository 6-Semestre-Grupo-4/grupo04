'use client';

import { useState, useEffect } from 'react';
import { Button, Badge, TextInput } from 'flowbite-react';
import { HiPlus, HiSearch } from 'react-icons/hi';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import ToastNotification from '@/components/billing/toastNotification';
import TitleForm from '@/components/titles/TitleForm';
import ConfirmDialog from '@/components/billing/confirmDialog';
import { Title } from '@/types/title';
import { getTitles, saveTitle, deleteTitle, getCompanies } from '@/services/titleService';



const getStatusBadge = (active: boolean) =>
  active ? (
    <span className="status-badge status-active">
      <FiCheck size={12} />
      Ativo
    </span>
  ) : (
    <span className="status-badge status-inactive">
      <FiX size={12} />
      Inativo
    </span>
  );

const getTypeLabel = (type: string) =>
  type === 'income' ? 'Receita' : type === 'expense' ? 'Despesa' : 'Indefinido';

export default function TitlesPage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTitle, setEditingTitle] = useState<Title | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; uuid?: string } | null>(null);


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

  const getCompanyName = (companyId: string) => {
    const company = companies.find(c => c.uuid === companyId);
    return company?.fantasy_name || 'N/A';
  };

  useEffect(() => {
    fetchTitles();
    fetchCompanies();
  }, []);


  const handleSave = async (title: any, uuid?: string) => {
    try {
      await saveTitle(title, uuid);
      setToast({
        message: uuid ? 'Título atualizado com sucesso!' : 'Título cadastrado com sucesso!',
        type: 'success',
      });
      setShowModal(false);
      setEditingTitle(null);
      fetchTitles();
    } catch {
      setToast({ message: 'Erro ao salvar o título.', type: 'error' });
    }
  };

  const confirmDelete = (uuid: string) => setConfirmDialog({ show: true, uuid });

  const handleDelete = async () => {
    if (!confirmDialog?.uuid) return;
    try {
      await deleteTitle(confirmDialog.uuid);
      setToast({ message: 'Título excluído com sucesso!', type: 'success' });
      fetchTitles();
    } catch {
      setToast({ message: 'Erro ao excluir o título.', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };


  const filteredTitles = titles.filter((title) => {
    const matchesSearch = title.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || title.type_of === filterType;
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && title.active) ||
      (filterActive === 'inactive' && !title.active);
    return matchesSearch && matchesType && matchesActive;
  });

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen" style={{ background: 'var(--background)', color: 'var(--color-text)' }}>
      <div className="card-enhanced rounded-xl p-6 space-y-6 animate-[fade-in_0.5s_ease-in-out]">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Títulos</h1>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Gerencie receitas e despesas cadastradas com facilidade.</p>
          </div>

          <Button
            onClick={() => {
              setEditingTitle(null);
              setShowModal(true);
            }}
            className="btn-primary font-medium flex items-center gap-2 px-6 py-3 rounded-lg text-white shadow-lg"
          >
            <HiPlus className="w-5 h-5" />
            Novo Título
          </Button>
        </div>


        <div className="flex flex-col md:flex-row gap-4">
          <TextInput
            placeholder="Digite para buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96"
          />

          <div className={`select-wrapper w-full md:w-40 ${filterType !== 'all' ? 'filter-active' : ''}`}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="custom-select"
              data-placeholder={filterType === 'all' ? 'true' : 'false'}
            >
              <option value="all">Selecione o tipo...</option>
              <option value="income">Receitas</option>
              <option value="expense">Despesas</option>
            </select>
          </div>

          <div className={`select-wrapper w-full md:w-40 ${filterActive !== 'all' ? 'filter-active' : ''}`}>
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="custom-select"
              data-placeholder={filterActive === 'all' ? 'true' : 'false'}
            >
              <option value="all">Selecione o status...</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>


        <div className="overflow-x-auto rounded-lg card-enhanced">
          <table className="w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="text-xs uppercase" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
              <tr>
                <th className="px-6 py-3">Descrição</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Vencimento</th>
                <th className="px-6 py-3">Taxa Juros</th>
                <th className="px-6 py-3">Parcelas</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Recorrente</th>
                <th className="px-6 py-3 text-center">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredTitles.length > 0 ? (
                filteredTitles.map((title) => (
                  <tr
                    key={title.uuid}
                    className="border-b"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <td className="px-6 py-4 font-medium">{title.description}</td>
                    <td className="px-6 py-4">
                      {typeof title.company === 'string' ? getCompanyName(title.company) : 'N/A'}
                    </td>
                    <td className="px-6 py-4">{getTypeLabel(title.type_of)}</td>
                    <td className="px-6 py-4">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(title.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(title.expiration_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      {title.fees_percentage_monthly ? 
                        `${(title.fees_percentage_monthly * 100).toFixed(2)}%` : 
                        '0%'
                      }
                    </td>
                    <td className="px-6 py-4">
                      {title.installments || 'À vista'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(title.active)}</td>
                    <td className="px-6 py-4">
                      {title.recorrence ? (
                        <Badge color="info" className="text-xs">
                          {title.recorrence_period ? {
                            daily: 'Diário',
                            weekly: 'Semanal',
                            monthly: 'Mensal',
                            yearly: 'Anual',
                          }[title.recorrence_period] || 'Sim' : 'Sim'}
                        </Badge>
                      ) : (
                        <Badge color="gray" className="text-xs">Não</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setEditingTitle(title);
                          setShowModal(true);
                        }}
                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 transition-all duration-200 dark:bg-blue-500 dark:hover:bg-blue-600"
                        title="Editar"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(title.uuid)}
                        className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all duration-200 dark:bg-red-500 dark:hover:bg-red-600"
                        title="Excluir"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">
                    Nenhum título cadastrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modais e notificações */}
        <TitleForm
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          title={editingTitle}
          companies={companies}
        />

        {confirmDialog?.show && (
          <ConfirmDialog
            show={confirmDialog.show}
            title="Excluir título"
            message="Tem certeza que deseja excluir este título? Esta ação não poderá ser desfeita."
            confirmText="Excluir"
            cancelText="Cancelar"
            onConfirm={handleDelete}
            onCancel={() => setConfirmDialog(null)}
          />
        )}

        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
