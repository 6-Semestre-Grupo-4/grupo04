'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button, Card, Label, Select, Spinner } from 'flowbite-react';
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
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [data, setData] = useState<BalanceteResponse | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  // ---------------------------------------------------------------------------
  // 🔵 CARREGA PLANOS DE CONTAS
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      try {
        const list = await getBillingPlans();
        setPlans(list.map((p: any) => ({ uuid: p.uuid, name: p.name })));
      } catch (err) {
        console.error(err);
        setToast({ message: 'Falha ao carregar planos de conta', type: 'error' });
      } finally {
        setLoadingPlans(false);
      }
    };
    load();
  }, []);

  // ---------------------------------------------------------------------------
  // 🔵 GERAR BALANCETE
  // ---------------------------------------------------------------------------
  const fetch = async () => {
    if (!plan || !start || !end) {
      setToast({ message: 'Selecione um plano e período.', type: 'warning' });
      return;
    }

    setLoading(true);
    setData(null);

    try {
      const params = { billing_plan: plan, start, end, include_zero: includeZero };
      const res = await reportService.getTrialBalance(params);

      setData(res);

      const initialExpanded: Record<string, boolean> = {};
      (res.tree || []).forEach((n) => (initialExpanded[n.uuid] = true));

      setExpanded(initialExpanded);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.detail ?? err.message ?? 'Erro ao gerar balancete';
      setToast({ message: String(msg), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 🔵 EXPANDE / RECOLHE NÓ
  // ---------------------------------------------------------------------------
  const toggle = useCallback(
    (uuid: string) => {
      setExpanded((prev) => ({ ...prev, [uuid]: !prev[uuid] }));
    },
    [setExpanded]
  );

  // ---------------------------------------------------------------------------
  // 🔵 EXPORTAR CSV
  // ---------------------------------------------------------------------------
  const exportCSV = () => {
    if (!data) return;
    const lines: string[] = [];

    lines.push(`Plano,${data.billing_plan}`);
    lines.push(`Período,${data.start} a ${data.end}`);
    lines.push('');
    lines.push('Código,Conta,Débito,Crédito,Saldo');

    const walk = (items: AccountNode[], prefix = '') => {
      items.forEach((n) => {
        lines.push(`${prefix}${n.code},${n.name},${n.debit},${n.credit},${n.balance}`);
        if (n.children?.length) walk(n.children, prefix + '  ');
      });
    };

    walk(data.tree);

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `balancete_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderNode = (n: AccountNode, level = 0) => {
    const isOpen = expanded[n.uuid];

    return (
      <div key={n.uuid}>
        {/* Linha da conta */}
        <div
          className={`border-border hover:bg-muted grid grid-cols-12 items-center border-b py-2`}
          style={{ paddingLeft: `${level * 20}px` }}
        >
          {/* Botão expandir */}
          <div className="col-span-1">
            {n.children?.length > 0 ? (
              <button onClick={() => toggle(n.uuid)} className="text-text-muted hover:text-text text-sm">
                {isOpen ? '▾' : '▸'}
              </button>
            ) : (
              <span className="text-text-muted/50">•</span>
            )}
          </div>

          {/* Código */}
          <div className="text-text col-span-2 font-mono text-sm">{n.code}</div>

          {/* Nome */}
          <div className="text-text col-span-4 text-sm">{n.name}</div>

          {/* Débito */}
          <div className="text-text col-span-2 text-right tabular-nums">
            {Number(n.debit).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </div>

          {/* Crédito */}
          <div className="text-text col-span-2 text-right tabular-nums">
            {Number(n.credit).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </div>

          {/* Saldo */}
          <div
            className={`col-span-1 text-right font-medium ${
              Number(n.balance) > 0 ? 'text-success' : Number(n.balance) < 0 ? 'text-error' : 'text-text-muted'
            }`}
          >
            {Number(n.balance).toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>

        {/* Filhos */}
        {isOpen && n.children?.map((child) => renderNode(child, level + 1))}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // 🔵 UI PRINCIPAL
  // ---------------------------------------------------------------------------
  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-3xl font-bold">Relatório Balancete</h1>
          <p className="text-text-muted">Balancete contábil com débitos, créditos e saldos por conta.</p>
        </div>

        <Card className="border-border bg-surface mb-6 p-4">
          {/* FORMULARIO */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Plano */}
            <div>
              <Label className="text-text">Plano de Contas</Label>

              {loadingPlans ? (
                <div className="flex h-10 items-center justify-center">
                  <Spinner size="sm" />
                </div>
              ) : (
                <Select value={plan} onChange={(e) => setPlan(e.target.value)} className="w-full">
                  <option value="">Selecionar</option>
                  {plans.map((p) => (
                    <option key={p.uuid} value={p.uuid}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              )}
            </div>

            {/* Início */}
            <div>
              <Label className="text-text">Início</Label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="border-border bg-surface text-text w-full rounded border p-2"
              />
            </div>

            {/* Fim */}
            <div>
              <Label className="text-text">Fim</Label>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="border-border bg-surface text-text w-full rounded border p-2"
              />
            </div>

            {/* Opções */}
            <div>
              <Label className="text-text">Opções</Label>
              <div className="mt-2 flex gap-2">
                <input
                  id="includeZero"
                  type="checkbox"
                  checked={includeZero}
                  onChange={(e) => setIncludeZero(e.target.checked)}
                  className="border-border bg-surface text-primary focus:ring-primary rounded"
                />
                <Label htmlFor="includeZero" className="text-text">
                  Incluir contas zeradas
                </Label>
              </div>
            </div>
          </div>

          {/* AÇÕES */}
          <div className="mt-4 flex justify-end gap-2">
            {data && (
              <Button color="gray" onClick={exportCSV} className="bg-muted hover:bg-muted-foreground/20">
                Exportar CSV
              </Button>
            )}

            <Button onClick={fetch} disabled={loading} className="btn-primary">
              {loading ? <Spinner size="sm" /> : 'Gerar Balancete'}
            </Button>
          </div>
        </Card>

        {/* RESULTADO */}
        {data && (
          <>
            {/* Totais */}
            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="border-border bg-surface">
                <div className="text-text-muted text-sm">Total Débitos</div>
                <div className="text-text text-2xl font-bold">R$ {Number(data.totals.debits).toFixed(2)}</div>
              </Card>

              <Card className="border-border bg-surface">
                <div className="text-text-muted text-sm">Total Créditos</div>
                <div className="text-text text-2xl font-bold">R$ {Number(data.totals.credits).toFixed(2)}</div>
              </Card>

              <Card className="border-border bg-surface">
                <div className="text-text-muted text-sm">Diferença</div>
                <div
                  className={`text-2xl font-bold ${
                    Number(data.totals.difference) === 0 ? 'text-success' : 'text-error'
                  }`}
                >
                  R$ {Number(data.totals.difference).toFixed(2)}
                </div>
              </Card>
            </div>

            {/* Árvore */}
            <Card className="border-border bg-surface">
              <div className="mb-3 flex justify-between">
                <h2 className="text-foreground text-lg font-semibold">Plano de Contas</h2>
                <div className="text-text-muted text-xs">
                  {data.start} — {data.end}
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                {/* Cabeçalho fixo */}
                <div className="border-border bg-muted text-text sticky top-0 grid grid-cols-12 border-b py-2 text-sm font-semibold">
                  <div className="col-span-1"></div>
                  <div className="col-span-2">Código</div>
                  <div className="col-span-4">Conta</div>
                  <div className="col-span-2 text-right">Débito</div>
                  <div className="col-span-2 text-right">Crédito</div>
                  <div className="col-span-1 text-right">Saldo</div>
                </div>

                {data.tree.length === 0 ? (
                  <div className="text-text-muted p-4 text-sm">Nenhuma movimentação encontrada.</div>
                ) : (
                  data.tree.map((node) => renderNode(node))
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
