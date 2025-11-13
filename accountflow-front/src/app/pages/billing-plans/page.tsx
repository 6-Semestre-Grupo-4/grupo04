'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import ToastNotification from '@/components/toastNotification';
import BillingPlanForm from '@/components/billing/billingPlanForm';
import ConfirmDialog from '@/components/billing/confirmDialog';
import { BillingPlan } from '@/types/billingPlan';
import { getBillingPlans, saveBillingPlan, deleteBillingPlan } from '@/services/billingPlanService';

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
    <div className="p-10 min-h-screen transition-all">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Planos de Contas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie os planos e suas contas estruturadas.</p>
        </div>

        <Button
          className="bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white shadow-md transition-all"
          onClick={handleNew}
        >
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {billingPlans.map((plan) => (
          <div
            key={plan.uuid}
            role="button"
            tabIndex={0}
            className="
              p-5 bg-white dark:bg-gray-800 rounded-xl 
              shadow-sm border border-gray-200 dark:border-gray-700 
              hover:shadow-xl hover:scale-[1.02] hover:border-gray-400 dark:hover:border-gray-500
              transition-all duration-200 cursor-pointer relative group
            "
            onClick={() => router.push(`billing-plans/${plan.uuid}`)}
          >
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{plan.description}</p>
            </div>

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(plan);
                }}
                className="p-1 bg-white/60 dark:bg-gray-700/50 rounded-md hover:scale-105 transition"
                title="Editar"
              >
                <FiEdit2 size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(plan.uuid);
                }}
                className="p-1 bg-white/60 dark:bg-gray-700/50 rounded-md hover:scale-105 transition"
                title="Excluir"
              >
                <FiTrash2 size={18} />
              </button>
            </div>

            <div
              className="
                mt-4 flex items-center gap-2 
                opacity-0 group-hover:opacity-100 transition
                text-blue-600 dark:text-blue-400
              "
            >
              <FiEye size={20} />
              <span className="text-sm font-medium">Ver hierarquia</span>
            </div>
          </div>
        ))}

        {billingPlans.length === 0 && (
          <div className="text-center col-span-full text-gray-400 py-10">Nenhum plano cadastrado ainda.</div>
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
