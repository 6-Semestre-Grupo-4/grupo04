import api from '@/services/api';
import { BillingAccount } from '@/types/billingAccount';

type BillingAccountPayload = {
  name: string;
  account_type: 'analytic' | 'synthetic';
  parent: string | null;
  billing_plan: string;
};

const cache = new Map<string, { data: BillingAccount[]; timestamp: number }>();
const CACHE_DURATION = 30000;

export async function getBillingAccounts(planId: string): Promise<BillingAccount[]> {
  const cacheKey = `billing-accounts-${planId}`;
  const currentTime = Date.now();
  const cached = cache.get(cacheKey);

  if (cached && currentTime - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const res = await api.get(`billing-account/by-plan/${planId}/`);
    cache.set(cacheKey, { data: res.data, timestamp: currentTime });
    return res.data;
  } catch (error) {
    console.error('Erro ao buscar contas:', error);
    throw new Error('Erro ao buscar contas');
  }
}

export function clearBillingAccountsCache(planId: string) {
  if (planId) {
    cache.delete(`billing-accounts-${planId}`);
  } else {
    cache.clear();
  }
}

export async function saveBillingAccount(account: BillingAccountPayload, uuid?: string): Promise<BillingAccount> {
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
