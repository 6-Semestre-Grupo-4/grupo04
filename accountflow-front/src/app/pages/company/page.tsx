'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button, Card, Badge, Avatar } from 'flowbite-react';
import ToastNotification from '@/components/toastNotification';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiMail, FiPhone, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

import companyService from '@/services/companyService';

interface Company {
  uuid: string;
  cnpj: string;
  fantasy_name: string;
  social_reason: string;
  email: string;
  phone: string;
  tax_regime: string;
  logo?: string;
  address: {
    city: string;
    state: string;
  };
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; company: Company | null }>({
    open: false,
    company: null,
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Simular carregamento da API
    const loadCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await companyService.getAll();
        setCompanies(response);
      } catch (err) {
        console.error('Erro carregando empresas:', err);
        setCompanies([]);
      }
      setIsLoading(false);
    };

    loadCompanies();
  }, []);

  const getTaxRegimeLabel = (regime: string) => {
    switch (regime) {
      case 'simples_nacional':
        return 'Simples Nacional';
      case 'lucro_presumido':
        return 'Lucro Presumido';
      case 'lucro_real':
        return 'Lucro Real';
      default:
        return regime;
    }
  };

  const getTaxRegimeColor = (regime: string) => {
    switch (regime) {
      case 'simples_nacional':
        return 'success';
      case 'lucro_presumido':
        return 'warning';
      case 'lucro_real':
        return 'info';
      default:
        return 'gray';
    }
  };

  const handleEdit = (company: Company) => {
    window.location.href = `/pages/company/edit/${company.uuid}`;
  };

  const handleDeleteClick = (company: Company) => {
    setDeleteModal({ open: true, company });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.company) return;

    try {
      // Chama backend para deletar
      await companyService.delete(deleteModal.company.uuid);

      // Remover da lista local
      setCompanies((prev) => prev.filter((c) => c.uuid !== deleteModal.company?.uuid));

      setToast({ message: `Empresa "${deleteModal.company.fantasy_name}" excluída com sucesso!`, type: 'success' });
    } catch {
      setToast({ message: 'Erro ao excluir empresa. Tente novamente.', type: 'error' });
    } finally {
      setDeleteModal({ open: false, company: null });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, company: null });
  };

  if (isLoading) {
    return (
      <div className="card-enhanced min-h-screen animate-[fade-in_0.5s_ease-in-out] space-y-6 rounded-xl bg-gray-50 p-6 transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-enhanced min-h-screen animate-[fade-in_0.5s_ease-in-out] space-y-6 rounded-xl bg-gray-50 p-6 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Empresas</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Gerencie as empresas cadastradas no sistema</p>
          </div>
          <Link href="/pages/company/register">
            <Button color="blue" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <FiPlus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <Card className="border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="py-12 text-center">
              <FiUsers className="mx-auto mb-4 h-16 w-16 text-gray-400 dark:text-gray-500" />
              <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">Nenhuma empresa cadastrada</h3>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Comece cadastrando sua primeira empresa no sistema.
              </p>
              <Link href="/pages/company/register">
                <Button color="blue" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  <FiPlus className="mr-2 h-4 w-4" />
                  Cadastrar Primeira Empresa
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <Card
                key={company.uuid}
                className="border-gray-200 bg-white transition-shadow hover:border-gray-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar alt={company.fantasy_name} img={company.logo} rounded size="md" className="bg-transparent">
                      <div className="font-medium text-gray-900 dark:text-white">{company.fantasy_name.charAt(0)}</div>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{company.fantasy_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{company.cnpj}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      color="gray"
                      outline
                      onClick={() => handleEdit(company)}
                      title="Editar empresa"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <FiEdit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="xs"
                      color="failure"
                      outline
                      onClick={() => handleDeleteClick(company)}
                      title="Excluir empresa"
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <FiTrash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Razão Social:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{company.social_reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiMail className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{company.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiPhone className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{company.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {company.address.city}/{company.address.state}
                      </p>
                    </div>
                    <Badge color={getTaxRegimeColor(company.tax_regime)} size="sm">
                      {getTaxRegimeLabel(company.tax_regime)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {deleteModal.open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md transition-all duration-300 ease-in-out dark:bg-black/50"
            onClick={handleDeleteCancel}
          >
            <div
              className="w-full max-w-md scale-100 transform rounded-xl border border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] dark:border-gray-700/30 dark:bg-gray-800/95"
              onClick={(e) => e.stopPropagation()}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                animation: 'modalSlideUp 0.3s ease-out',
              }}
            >
              <div className="mb-4 flex items-center gap-2">
                <FiAlertTriangle className="h-6 w-6 text-red-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Confirmar Exclusão</h3>
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-gray-700 dark:text-gray-300">
                  Tem certeza que deseja excluir a empresa{' '}
                  <strong className="text-gray-900 dark:text-white">{deleteModal.company?.fantasy_name}</strong>?
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esta ação não pode ser desfeita. Todos os dados relacionados à empresa serão permanentemente
                  removidos.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  color="gray"
                  onClick={handleDeleteCancel}
                  className="border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  color="failure"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}

        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
