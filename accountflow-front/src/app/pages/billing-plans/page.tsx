'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Label, TextInput } from 'flowbite-react';

type BillingPlan = {
  uuid: string;
  name: string;
  description: string;
};

export default function BillingPlansPage() {
  const router = useRouter();
  const [billingPlans, setBillingPlans] = useState<BillingPlan[]>([
    { uuid: 'plan-001', name: 'Plano Principal', description: 'Plano de contas padrão' },
    { uuid: 'plan-002', name: 'Plano Secundário', description: 'Plano adicional para fornecedores' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', description: '' });

  const addPlan = () => {
    if (!newPlan.name.trim()) {
      alert('Informe o nome do plano.');
      return;
    }
    const plan: BillingPlan = {
      uuid: crypto.randomUUID(),
      name: newPlan.name,
      description: newPlan.description,
    };
    setBillingPlans((prev) => [...prev, plan]);
    setShowModal(false);
    setNewPlan({ name: '', description: '' });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Planos de Contas</h1>
          <p className="text-gray-500">Selecione um plano para gerenciar suas contas.</p>
        </div>
        <Button color="blue" onClick={() => setShowModal(true)}>
          Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {billingPlans.map((plan) => (
          <div
            key={plan.uuid}
            className="p-4 bg-white shadow rounded-lg hover:shadow-md cursor-pointer border"
            onClick={() => router.push(`billing-plans/${plan.uuid}`)}
          >
            <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
          </div>
        ))}
      </div>

      {/* Modal de criação de novo plano */}
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Novo Plano de Contas</h2>

          <div>
            <Label htmlFor="planName">Nome</Label>
            <TextInput
              id="planName"
              value={newPlan.name}
              onChange={(e) => setNewPlan((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="planDesc">Descrição</Label>
            <TextInput
              id="planDesc"
              value={newPlan.description}
              onChange={(e) => setNewPlan((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button color="blue" onClick={addPlan}>Salvar</Button>
            <Button color="gray" onClick={() => setShowModal(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
