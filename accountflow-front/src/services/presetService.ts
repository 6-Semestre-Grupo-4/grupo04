import api from './api';

const ENDPOINT_URL = 'preset/';
const BILLING_ACCOUNT_URL = 'billing-account/';
const BILLING_ACCOUNT_BY_PLAN_URL = 'billing-account/by-plan/';
const BILLING_PLAN_URL = 'billing-plan/';

export interface PresetPayload {
  name?: string;
  description?: string;
  billing_plan?: string;
  payable_account?: string;
  receivable_account?: string;
}

// Buscar todos os planos de contas
export async function getBillingPlans() {
  const res = await api.get(BILLING_PLAN_URL);
  return res.data;
}

// Buscar todas as contas contábeis
export async function getBillingAccounts() {
  const res = await api.get(BILLING_ACCOUNT_URL);
  return res.data;
}

// Buscar contas de um plano específico
export async function getAccountsByPlan(planUuid: string) {
  const res = await api.get(`${BILLING_ACCOUNT_BY_PLAN_URL}${planUuid}/`);
  return res.data;
}

// Buscar presets
export async function getPresets() {
  const res = await api.get(ENDPOINT_URL);
  return res.data;
}

// Criar ou editar
export async function savePreset(preset: PresetPayload, uuid?: string) {
  if (uuid) {
    const res = await api.put(`${ENDPOINT_URL}${uuid}/`, preset);
    return res.data;
  } else {
    const res = await api.post(ENDPOINT_URL, preset);
    return res.data;
  }
}

// Excluir
export async function deletePreset(uuid: string) {
  const res = await api.delete(`${ENDPOINT_URL}${uuid}/`);
  return res.data;
}
