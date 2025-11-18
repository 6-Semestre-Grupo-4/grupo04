import api from '@/services/api';
import { BillingPlan } from '@/types/billingPlan';
import { handleApiError } from '@/components/utils/HandlerError';

type BillingPlanPayload = {
  name: string;
  description: string;
};

const ENDPOINT_URL = 'billing-plan/';

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function toArray<T>(data: T[] | Paginated<T> | any): T[] {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function getBillingPlans(): Promise<BillingPlan[]> {
  try {
    const res = await api.get(ENDPOINT_URL, { params: { page_size: 1000 } });
    return toArray<BillingPlan>(res.data);
  } catch (error) {
    handleApiError(error, 'Erro ao buscar planos');
    return [];
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
    throw error;
  }
}

export async function deleteBillingPlan(uuid: string): Promise<void> {
  try {
    await api.delete(`${ENDPOINT_URL}${uuid}/`);
  } catch (error) {
    handleApiError(error, 'Erro ao excluir plano');
    throw error;
  }
}