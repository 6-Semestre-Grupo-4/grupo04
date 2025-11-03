const API_URL = 'http://localhost:8000/api/v1/billing-plan/';

export async function getBillingPlans() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Erro ao buscar planos');
  return res.json();
}

export async function saveBillingPlan(plan: { name: string; description: string }, uuid?: string) {
  const url = uuid ? `${API_URL}${uuid}/` : API_URL;
  const method = uuid ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plan),
  });
  if (!res.ok) throw new Error('Erro ao salvar plano');
  return res.json();
}

export async function deleteBillingPlan(uuid: string) {
  const res = await fetch(`${API_URL}${uuid}/`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir plano');
}
