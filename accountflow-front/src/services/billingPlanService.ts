// Importe sua instância configurada do Axios
import api from '@/services/api';

type BillingPlanPayload = {
  name: string;
  description: string;
};

// URL do endpoint (sem o domínio, que já está no 'api')
const ENDPOINT_URL = 'billing-plan/';

export async function getBillingPlans() {
  try {
    // 1. Use api.get()
    // 2. A resposta já vem em res.data
    const res = await api.get(ENDPOINT_URL);
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    throw new Error('Erro ao buscar planos');
  }
}

export async function saveBillingPlan(plan: BillingPlanPayload, uuid?: string) {
  try {
    if (uuid) {
      // 3. Use api.put() para atualizar
      const res = await api.put(`${ENDPOINT_URL}${uuid}/`, plan);
      return res.data;
    } else {
      // 4. Use api.post() para criar
      const res = await api.post(ENDPOINT_URL, plan);
      return res.data;
    }
  } catch (error) {
    console.error('Erro ao salvar plano:', error);
    throw new Error('Erro ao salvar plano');
  }
}

export async function deleteBillingPlan(uuid: string) {
  try {
    // 5. Use api.delete()
    //    Não há 'return' pois o DELETE retorna 204 No Content
    await api.delete(`${ENDPOINT_URL}${uuid}/`);
  } catch (error) {
    console.error('Erro ao excluir plano:', error);
    throw new Error('Erro ao excluir plano');
  }
}
