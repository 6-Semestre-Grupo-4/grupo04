'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import ToastNotification from '@/components/utils/toastNotification';
import BillingPlanForm from '@/components/billing/billingPlanForm';
import ConfirmDialog from '@/components/utils/confirmDialog';
import { BillingPlan } from '@/types/billingPlan';
import { getBillingPlans, saveBillingPlan, deleteBillingPlan } from '@/services/billingPlanService';
import Link from 'next/link';

export default function BillingPlansPage() {
  const router = useRouter();

  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ show: boolean; uuid?: string } | null>(null);

  const fetchPlans = async () => {
    try {
      const data = await getBillingPlans();
      setBillingPlans(data);
    } catch {
      setToast({ message: 'Erro ao buscar planos.', type: 'error' });
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async (plan: { name: string; description: string }, uuid?: string) => {
    try {
      if (!plan.name.trim() || !plan.description.trim()) {
        setToast({ message: 'Preencha todos os campos obrigatórios.', type: 'warning' });
        return;
      }

      await saveBillingPlan(plan, uuid);
      setToast({
        message: uuid ? 'Plano atualizado com sucesso!' : 'Plano cadastrado com sucesso!',
        type: 'success',
      });

      setShowModal(false);
      setEditingPlan(null);
      fetchPlans();
    } catch {
      setToast({ message: 'Erro ao salvar o plano.', type: 'error' });
    }
  };

  const confirmDelete = (uuid: string) => {
    setConfirmDialog({ show: true, uuid });
  };

  const handleDelete = async () => {
    if (!confirmDialog?.uuid) return;
    try {
      await deleteBillingPlan(confirmDialog.uuid);
      setToast({ message: 'Plano excluído com sucesso!', type: 'success' });
      fetchPlans();
    } catch {
      setToast({ message: 'Erro ao excluir o plano.', type: 'error' });
    } finally {
      setConfirmDialog(null);
    }
  };

  const handleEdit = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen p-10 transition-all">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planos de Contas</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Gerencie os planos e suas contas estruturadas.</p>
        </div>

        <Button
          className="bg-gray-900 text-white shadow-md transition-all hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={handleNew}
        >
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {billingPlans.map((plan) => (
          <Link
            key={plan.uuid}
            href={`billing-plans/${plan.uuid}`}
            className="group relative cursor-pointer rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:scale-[1.02] hover:border-gray-400 hover:shadow-xl dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-500"
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 transition group-hover:opacity-100">

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleEdit(plan);
                }}
                className="rounded-md bg-white/60 p-1 transition hover:scale-105 dark:bg-gray-700/50"
                title="Editar"
              >
                <FiEdit2 size={18} />
              </button>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  confirmDelete(plan.uuid);
                }}
                className="rounded-md bg-white/60 p-1 transition hover:scale-105 dark:bg-gray-700/50"
                title="Excluir"
              >
                <FiTrash2 size={18} />
              </button>
            </div>

          </Link>
        ))}

        {billingPlans.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-400">Nenhum plano cadastrado ainda.</div>
        )}
      </div>

      <BillingPlanForm show={showModal} onClose={() => setShowModal(false)} onSave={handleSave} editing={editingPlan} />

      {confirmDialog?.show && (
        <ConfirmDialog
          show={confirmDialog.show}
          title="Excluir plano de contas"
          message="Tem certeza que deseja excluir este plano? Esta ação não poderá ser desfeita."
          confirmText="Excluir"
          cancelText="Cancelar"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
