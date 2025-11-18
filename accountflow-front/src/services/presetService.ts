import api from './api';
import type { Preset } from '@/types/preset';

const ENDPOINT_URL = 'preset/';
const BILLING_ACCOUNT_URL = 'billing-account/';
const BILLING_ACCOUNT_BY_PLAN_URL = 'billing-account/by-plan/';
const BILLING_PLAN_URL = 'billing-plan/';

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function toArray<T>(data: T[] | Paginated<T> | any): T[] {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export async function getBillingPlans() {
  const res = await api.get(BILLING_PLAN_URL, { params: { page_size: 1000 } });
  return toArray(res.data);
}

export async function getBillingAccounts() {
  const res = await api.get(BILLING_ACCOUNT_URL, { params: { page_size: 1000 } });
  return toArray(res.data);
}

export async function getAccountsByPlan(planUuid: string) {
  const res = await api.get(`${BILLING_ACCOUNT_BY_PLAN_URL}${planUuid}/`);
  return res.data;
}

export async function getPresets(): Promise<Preset[]> {
  const res = await api.get(ENDPOINT_URL, { params: { page_size: 1000 } });
  return toArray<Preset>(res.data);
}

export interface PresetPayload {
  name?: string;
  description?: string;
  billing_plan?: string;
  payable_account?: string;
  receivable_account?: string;
}

export async function savePreset(preset: PresetPayload, uuid?: string) {
  if (uuid) {
    const res = await api.put(`${ENDPOINT_URL}${uuid}/`, preset);
    return res.data;
  } else {
    const res = await api.post(ENDPOINT_URL, preset);
    return res.data;
  }
}

export async function deletePreset(uuid: string) {
  const res = await api.delete(`${ENDPOINT_URL}${uuid}/`);
  return res.data;
}