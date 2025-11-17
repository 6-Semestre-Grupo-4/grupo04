// Importe sua instância configurada do Axios
import api from '@/services/api';
import { BillingPlan } from '@/types/billingPlan';
import { handleApiError } from '@/components/utils/HandlerError';

type BillingPlanPayload = {
  name: string;
  description: string;
};

// URL do endpoint (sem o domínio, que já está no 'api')
const ENDPOINT_URL = 'billing-plan/';

export async function getBillingPlans(): Promise<BillingPlan[]> {
  try {
    const res = await api.get<BillingPlan[]>(ENDPOINT_URL);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Erro ao buscar planos');
  }
}

export async function saveBillingPlan(plan: BillingPlanPayload, uuid?: string): Promise<BillingPlan> {
  try {
    const url = uuid ? `${ENDPOINT_URL}${uuid}/` : ENDPOINT_URL;
    const method = uuid ? api.put : api.post;

    const res = await method<BillingPlan>(url, plan);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Erro ao salvar plano');
  }
}

export async function deleteBillingPlan(uuid: string): Promise<void> {
  try {
    await api.delete(`${ENDPOINT_URL}${uuid}/`);
  } catch (error) {
    handleApiError(error, 'Erro ao excluir plano');
  }
}
