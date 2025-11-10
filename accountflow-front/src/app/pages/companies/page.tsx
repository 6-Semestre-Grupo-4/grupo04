'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button, Card, Badge, Avatar } from 'flowbite-react';
import { FiPlus, FiEdit, FiTrash2, FiUsers, FiMail, FiPhone, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';

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

// Dados mockados para demonstração
const mockCompanies: Company[] = [
  {
    uuid: '1',
    cnpj: '11.222.333/0001-44',
    fantasy_name: 'TechFlow Soluções',
    social_reason: 'TechFlow Soluções em Tecnologia Ltda',
    email: 'contato@techflow.com.br',
    phone: '(11) 3456-7890',
    tax_regime: 'simples_nacional',
    address: {
      city: 'São Paulo',
      state: 'SP',
    },
  },
  {
    uuid: '2',
    cnpj: '22.333.444/0001-55',
    fantasy_name: 'Inovação Digital',
    social_reason: 'Inovação Digital e Consultoria S/A',
    email: 'info@inovacaodigital.com.br',
    phone: '(21) 2345-6789',
    tax_regime: 'lucro_presumido',
    address: {
      city: 'Rio de Janeiro',
      state: 'RJ',
    },
  },
  {
    uuid: '3',
    cnpj: '33.444.555/0001-66',
    fantasy_name: 'StartUp Hub',
    social_reason: 'StartUp Hub Aceleradora de Negócios Ltda',
    email: 'hello@startuphub.com.br',
    phone: '(31) 9876-5432',
    tax_regime: 'lucro_real',
    address: {
      city: 'Belo Horizonte',
      state: 'MG',
    },
  },
];

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; company: Company | null }>({
    open: false,
    company: null,
  });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    // Simular carregamento da API
    const loadCompanies = async () => {
      setIsLoading(true);

      // TODO: Descomentar quando backend estiver pronto
      // const response = await companyService.getAll();
      // setCompanies(response);

      // Simulação de delay da API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Usar dados mockados
      setCompanies(mockCompanies);
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
    window.location.href = `/pages/companies/edit/${company.uuid}`;
  };

  const handleDeleteClick = (company: Company) => {
    setDeleteModal({ open: true, company });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.company) return;

    try {
      // TODO: Descomentar quando backend estiver pronto
      // await companyService.delete(deleteModal.company.uuid);

      // Simular exclusão removendo da lista
      setCompanies((prev) => prev.filter((c) => c.uuid !== deleteModal.company?.uuid));

      setToast({
        show: true,
        message: `Empresa "${deleteModal.company.fantasy_name}" excluída com sucesso!`,
        type: 'success',
      });
    } catch {
      setToast({
        show: true,
        message: 'Erro ao excluir empresa. Tente novamente.',
        type: 'error',
      });
    } finally {
      setDeleteModal({ open: false, company: null });

      // Ocultar toast após 3 segundos
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3000);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ open: false, company: null });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 card-enhanced rounded-xl p-6 space-y-6 animate-[fade-in_0.5s_ease-in-out] transition-colors duration-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 card-enhanced rounded-xl p-6 space-y-6 animate-[fade-in_0.5s_ease-in-out] transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Empresas</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Gerencie as empresas cadastradas no sistema</p>
          </div>
          <Link href="/pages/companies/register">
            <Button color="blue" className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
              <FiPlus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Nenhuma empresa cadastrada</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Comece cadastrando sua primeira empresa no sistema.
              </p>
              <Link href="/pages/companies/register">
                <Button color="blue" className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600">
                  <FiPlus className="mr-2 h-4 w-4" />
                  Cadastrar Primeira Empresa
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card
                key={company.uuid}
                className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              >
                <div className="flex items-start justify-between mb-4">
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
                      className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FiEdit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="xs"
                      color="failure"
                      outline
                      onClick={() => handleDeleteClick(company)}
                      title="Excluir empresa"
                      className="border-red-300 dark:border-red-600 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/30 dark:bg-black/50 transition-all duration-300 ease-in-out"
            onClick={handleDeleteCancel}
          >
            <div
              className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border border-white/20 dark:border-gray-700/30 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300 ease-out scale-100 hover:scale-[1.02]"
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
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  color="failure"
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white"
                >
                  <FiTrash2 className="mr-2 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}

        {toast.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg shadow-lg border ${
                toast.type === 'success'
                  ? 'border-l-4 border-green-500 dark:border-green-400'
                  : 'border-l-4 border-red-500 dark:border-red-400'
              } border-gray-200 dark:border-gray-700`}
            >
              <div
                className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${
                  toast.type === 'success'
                    ? 'text-green-500 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
                    : 'text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
                }`}
              >
                {toast.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiX className="w-5 h-5" />}
              </div>
              <div className="ml-3 text-sm font-normal text-gray-900 dark:text-gray-100 flex-1">{toast.message}</div>
              <button
                type="button"
                className="ml-auto -mx-1.5 -my-1.5 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 rounded-lg focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex h-8 w-8"
                onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
