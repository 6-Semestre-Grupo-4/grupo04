import api from '@/services/api';

type BillingAccountPayload = {
  name: string;
  account_type: 'analytic' | 'synthetic';
  parent: string | null;
  billing_plan: string;
};

export async function getBillingAccounts(planId: string) {
  try {
    const res = await api.get(`billing-account/by-plan/${planId}/`);
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    throw new Error('Erro ao buscar contas');
  }
}

export async function saveBillingAccount(account: BillingAccountPayload, uuid?: string) {
  try {
    if (uuid) {
      const res = await api.put(`billing-account/${uuid}/`, account);
      return res.data;
    } else {
      const res = await api.post('billing-account/', account);
      return res.data;
    }
  } catch (error) {
    console.error('Erro ao salvar conta:', error);
    throw new Error('Erro ao salvar conta contábil');
  }
}

export async function deleteBillingAccount(uuid: string) {
  try {
    await api.delete(`billing-account/${uuid}/`);
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    throw new Error('Erro ao excluir conta');
  }
}
