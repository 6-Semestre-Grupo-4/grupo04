'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Label, Select } from 'flowbite-react';
import ToastNotification from '@/components/utils/toastNotification';
import reportService from '@/services/reportService';
import { getBillingPlans } from '@/services/billingPlanService'; 

type AccountNode = {
  uuid: string;
  code: string;
  name: string;
  debit: string;
  credit: string;
  balance: string;
  children: AccountNode[];
};

type BalanceteResponse = {
  billing_plan: string;
  start: string;
  end: string;
  totals: { debits: string; credits: string; difference: string };
  tree: AccountNode[];
};

export default function BalancetePage() {
  const [plans, setPlans] = useState<Array<{ uuid: string; name: string }>>([]);
  const [plan, setPlan] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [includeZero, setIncludeZero] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BalanceteResponse | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(
    null
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Usa o service centralizado para garantir comportamento consistente (paginado vs array)
    const load = async () => {
      try {
        // Se o seu service getBillingPlans já retorna array (tratando paginação), use-o.
        const list = await getBillingPlans();
        // Normaliza: espera-se um array de { uuid, name }
        setPlans(list.map((p: any) => ({ uuid: p.uuid, name: p.name })));
      } catch (err) {
        console.error('Erro ao carregar planos de conta', err);
        setToast({ message: 'Falha ao carregar planos', type: 'error' });
      }
    };
    load();
  }, []);

  const fetch = async () => {
    if (!plan || !start || !end) {
      setToast({ message: 'Selecione plano e período', type: 'warning' });
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const params: any = { billing_plan: plan, start, end, include_zero: includeZero };
      const res = await reportService.getTrialBalance(params);
      setData(res);
      // expand top-level by default
      const newExp: Record<string, boolean> = {};
      (res.tree || []).forEach((n: AccountNode) => (newExp[n.uuid] = true));
      setExpanded(newExp);
    } catch (err: any) {
      console.error('Erro ao gerar balancete', err);
      const msg = err?.response?.data?.detail || err?.message || 'Erro ao gerar balancete';
      setToast({ message: String(msg), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggle = (uuid: string) => setExpanded((s) => ({ ...s, [uuid]: !s[uuid] }));

  const exportCSV = () => {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`Plano,${data.billing_plan}`);
    lines.push(`Periodo,${data.start} a ${data.end}`);
    lines.push('');
    lines.push('Conta Codigo,Conta Nome,Debitos,Creditos,Saldo');
    const walk = (nodes: AccountNode[], prefix = '') => {
      nodes.forEach((n) => {
        lines.push(
          `${prefix}${n.code},${n.name},${Number(n.debit).toFixed(2)},${Number(n.credit).toFixed(
            2
          )},${Number(n.balance).toFixed(2)}`
        );
        if (n.children && n.children.length) walk(n.children, prefix + '  ');
      });
    };
    walk(data.tree || []);
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balancete_${data.billing_plan}_${data.start}_a_${data.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // simple recursive UI renderer
  const renderNode = (n: AccountNode, level = 0) => {
    const isOpen = !!expanded[n.uuid];
    return (
      <div key={n.uuid} className="border-b py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              aria-label="toggle"
              onClick={() => toggle(n.uuid)}
              className="w-6 h-6 flex items-center justify-center rounded text-sm"
            >
              {n.children && n.children.length ? (isOpen ? '▾' : '▸') : null}
            </button>
            <div className="ml-1">
              <div className="text-sm font-medium">
                {n.code} — {n.name}
              </div>
              <div className="text-xs text-gray-500">nível {n.code.split('.').length}</div>
            </div>
          </div>
          <div className="text-right text-sm tabular-nums">
            <div>Débito: R$ {Number(n.debit).toFixed(2)}</div>
            <div>Crédito: R$ {Number(n.credit).toFixed(2)}</div>
            <div className={`${Number(n.balance) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Saldo: R$ {Number(n.balance).toFixed(2)}
            </div>
          </div>
        </div>

        {isOpen && n.children && n.children.length > 0 && <div className="ml-6 mt-3">{n.children.map((c) => renderNode(c, level + 1))}</div>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Balancete (Contábil)</h1>

        <Card className="mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Plano de Contas</Label>
              <Select value={plan} onChange={(e) => setPlan(e.target.value)}>
                <option value="">Selecionar</option>
                {plans.map((p) => (
                  <option key={p.uuid} value={p.uuid}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Início</Label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full rounded border p-2" />
            </div>
            <div>
              <Label>Fim</Label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full rounded border p-2" />
            </div>
            <div>
              <Label>Opções</Label>
              <div className="flex items-center gap-2">
                <input id="includeZero" type="checkbox" checked={includeZero} onChange={(e) => setIncludeZero(e.target.checked)} />
                <label htmlFor="includeZero">Incluir contas sem movimento</label>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            {data && (
              <Button color="gray" onClick={exportCSV}>
                Exportar CSV
              </Button>
            )}
            <Button onClick={fetch} disabled={loading}>
              {loading ? 'Gerando…' : 'Gerar Balancete'}
            </Button>
          </div>
        </Card>

        {data && (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-4">
              <Card>
                <div className="text-sm text-gray-500">Total Débitos</div>
                <div className="text-2xl font-bold">R$ {Number(data.totals.debits).toFixed(2)}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Total Créditos</div>
                <div className="text-2xl font-bold">R$ {Number(data.totals.credits).toFixed(2)}</div>
              </Card>
              <Card>
                <div className="text-sm text-gray-500">Diferença</div>
                <div className={`text-2xl font-bold ${Number(data.totals.difference) === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  R$ {Number(data.totals.difference).toFixed(2)}
                </div>
              </Card>
            </div>

            <Card>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-lg font-semibold">Árvore do Plano</div>
                <div className="text-xs text-gray-500">
                  Período: {data.start} — {data.end}
                </div>
              </div>

              <div>
                {data.tree.length === 0 && <div className="text-sm text-gray-500">Sem movimentação.</div>}
                {data.tree.map((n) => renderNode(n))}
              </div>
            </Card>
          </>
        )}
      </div>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
