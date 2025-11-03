'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'flowbite-react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import ToastNotification from '@/components/billing/toastNotification';
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
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Planos de Contas</h1>
          <p className="text-gray-500">Selecione um plano para gerenciar suas contas.</p>
        </div>
        <Button
          className="bg-[#0b2034] hover:bg-[#12314d] dark:bg-[#0b2034] dark:hover:bg-[#12314d] cursor-pointer"
          onClick={handleNew}
        >
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {billingPlans.map((plan) => (
          <div key={plan.uuid} className="relative p-4 bg-white shadow rounded-lg border hover:shadow-md transition">
            <div className="cursor-pointer" onClick={() => router.push(`billing-plans/${plan.uuid}`)}>
              <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
            </div>

            <div className="absolute top-3 right-3 flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(plan);
                }}
                className="text-primary hover:text-primary-900 cursor-pointer"
                title="Editar"
              >
                <FiEdit2 size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  confirmDelete(plan.uuid);
                }}
                className="text-red-600 hover:text-red-800 cursor-pointer"
                title="Excluir"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {billingPlans.length === 0 && (
          <p className="text-gray-400 text-center col-span-full py-6">Nenhum plano cadastrado ainda.</p>
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
          loading={false}
        />
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
