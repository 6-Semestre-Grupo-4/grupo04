'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button, Card, Badge, Avatar } from 'flowbite-react';
import ToastNotification from '@/components/utils/toastNotification';
import { FiEdit2, FiTrash2, FiUsers, FiMail, FiPhone, FiCheck, FiX, FiAlertTriangle } from 'react-icons/fi';
import companyService from '@/services/companyService';
import ConfirmDialog from '@/components/utils/confirmDialog';

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
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    company?: Company;
  } | null>(null);
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
    setConfirmDialog({ show: true, company });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog?.company) return;

    try {
      await companyService.delete(confirmDialog.company.uuid);

      setCompanies((prev) => prev.filter((c) => c.uuid !== confirmDialog.company?.uuid));

      setToast({
        message: `Empresa "${confirmDialog.company.fantasy_name}" excluída com sucesso!`,
        type: 'success',
      });
    } catch {
      setToast({
        message: 'Erro ao excluir empresa. Tente novamente.',
        type: 'error',
      });
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleDeleteCancel = () => setConfirmDialog(null);

  return (
    <div className="min-h-screen p-10 transition-all">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Empresas</h1>
            <p className="mt-2 text-text-muted">Gerencie as empresas cadastradas no sistema</p>
          </div>
          <Link href="/pages/company/register">
            <Button className="btn-primary shadow-md">
              Nova Empresa
            </Button>
          </Link>
        </div>

        {companies.length === 0 ? (
          <Card className="border-border bg-surface shadow-card">
            <div className="py-12 text-center">
              <FiUsers className="mx-auto mb-4 h-16 w-16 text-text-muted" />
              <h3 className="mb-2 text-lg font-medium text-foreground">Nenhuma empresa cadastrada</h3>
              <p className="mb-6 text-text-muted">
                Comece cadastrando sua primeira empresa no sistema.
              </p>
              <Link href="/pages/company/register">
                <Button className="btn-primary shadow-md">
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
                className="group relative border-border bg-surface transition-all hover:scale-[1.02] hover:shadow-lg shadow-card"
              >
                {/* Botões flutuantes iguais ao plano de contas */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleEdit(company);
                    }}
                    className="rounded-md bg-surface/60 backdrop-blur-sm p-1 transition hover:scale-105"
                    title="Editar"
                  >
                    <FiEdit2 size={18} className="text-foreground" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteClick(company);
                    }}
                    className="rounded-md bg-surface/60 backdrop-blur-sm p-1 transition hover:scale-105"
                    title="Excluir"
                  >
                    <FiTrash2 size={18} className="text-foreground" />
                  </button>
                </div>

                {/* Conteúdo do card */}
                <div className="mb-4 flex items-start gap-3">
                  <Avatar alt={company.fantasy_name} img={company.logo} rounded size="md" className="bg-transparent">
                    <div className="font-medium text-foreground">{company.fantasy_name.charAt(0)}</div>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{company.fantasy_name}</h3>
                    <p className="text-sm text-text-muted">{company.cnpj}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Razão Social:</p>
                    <p className="text-sm text-text-muted">{company.social_reason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiMail className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-muted">{company.email}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FiPhone className="h-4 w-4 text-text-muted" />
                    <span className="text-sm text-text-muted">{company.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-text-muted">
                      {company.address.city} / {company.address.state}
                    </p>

                    <Badge color={getTaxRegimeColor(company.tax_regime)} size="sm">
                      {getTaxRegimeLabel(company.tax_regime)}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {confirmDialog?.show && (
          <ConfirmDialog
            show={confirmDialog.show}
            title="Excluir Empresa"
            message={`Tem certeza que deseja excluir a empresa "${confirmDialog.company?.fantasy_name}"? Esta ação não pode ser desfeita.`}
            confirmText="Excluir"
            cancelText="Cancelar"
            onConfirm={handleDeleteConfirm}
            onCancel={handleDeleteCancel}
          />
        )}

        {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
