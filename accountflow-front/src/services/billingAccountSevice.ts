const API_URL = 'http://localhost:8000/api/v1/billing-account/';

export async function getBillingAccounts(planId: string) {
  const res = await fetch(`${API_URL}?billing_plan_id=${planId}`);
  if (!res.ok) throw new Error('Erro ao buscar contas');
  return res.json();
}

export async function saveBillingAccount(account: any, uuid?: string) {
  const url = uuid ? `${API_URL}${uuid}/` : API_URL;
  const method = uuid ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(account),
  });
  if (!res.ok) throw new Error('Erro ao salvar conta contábil');
  return res.json();
}

export async function deleteBillingAccount(uuid: string) {
  const res = await fetch(`${API_URL}${uuid}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir conta');
}
