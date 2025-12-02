'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Label, Select } from 'flowbite-react';
import ToastNotification from '@/components/utils/toastNotification';
import companyService from '@/services/companyService';
import reportService, { DREResponse } from '@/services/reportService';

interface CompanyOption {
  uuid: string;
  fantasy_name: string;
}

export default function DreReportPage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [company, setCompany] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [group, setGroup] = useState<'account' | 'month' | ''>('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DREResponse | null>(null);
  const [tab, setTab] = useState<'monthly' | 'account' | 'summary' | 'details' | 'classic'>('summary');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  // Filters for details tab
  const [detailTypeFilter, setDetailTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [detailMethodFilter, setDetailMethodFilter] = useState<'all' | 'cash' | 'debit' | 'credit' | 'pix'>('all');
  const [detailTopLevelFilter, setDetailTopLevelFilter] = useState<string>('all');

  // Helpers to build lightweight charts without external deps
  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);

  const summaryBars = useMemo(() => {
    if (!data) return null;
    const rev = Math.max(0, Number(data.totals.revenues));
    const exp = Math.max(0, Math.abs(Number(data.totals.expenses)));
    const max = Math.max(rev, exp) || 1;
    const revPct = Math.round((rev / max) * 100);
    const expPct = Math.round((exp / max) * 100);
    return { revPct, expPct };
  }, [data]);

  const monthlyChart = useMemo(() => {
    if (!data?.monthly || data.monthly.length === 0) return null;
    // Build simple inline SVG line chart for result by month
    const points = data.monthly.map((m) => Number(m.result));
    const labels = data.monthly.map((m) => m.month);
    const w = Math.max(300, labels.length * 60);
    const h = 160;
    const pad = 20;
    const minY = Math.min(0, ...points);
    const maxY = Math.max(0, ...points);
    const rangeY = maxY - minY || 1;
    const xStep = (w - pad * 2) / Math.max(1, points.length - 1);
    const toX = (i: number) => pad + i * xStep;
    const toY = (v: number) => pad + (h - pad * 2) * (1 - (v - minY) / rangeY);
    const path = points.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(v)}`).join(' ');
    return { w, h, pad, labels, toX, toY, path, minY, maxY };
  }, [data]);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const list = await companyService.getAll();
        setCompanies(list.map((c: any) => ({ uuid: c.uuid, fantasy_name: c.fantasy_name })));
      } catch (e) {
        setToast({ message: 'Falha ao carregar empresas', type: 'error' });
      }
    };
    loadCompanies();
  }, []);

  const fetchReport = async () => {
    if (!company || !start || !end) {
      setToast({ message: 'Selecione empresa e período (início e fim).', type: 'warning' });
      return;
    }
    setLoading(true);
    setData(null);
    try {
      const params = { company, start, end, group: group || undefined } as any;
      const res = await reportService.getDRE(params);
      setData(res);
      // Decide default tab based on available breakdowns
      if (res.monthly) setTab('monthly');
      else if (res.by_account) setTab('account');
      else setTab('summary');
    } catch (error: any) {
      const respData = error?.response?.data;
      let message = 'Erro ao gerar DRE.';
      if (respData) {
        if (typeof respData === 'string') message = respData;
        else if (typeof respData === 'object') {
          message = Object.entries(respData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join(' | ');
        }
      }
      setToast({ message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;
    const lines: string[] = [];
    // Header info
    lines.push(`Empresa;${data.company}`);
    lines.push(`Periodo;${data.start} a ${data.end}`);
    lines.push('');
    // Totals
    lines.push('Secao;Receitas;Despesas;Resultado');
    lines.push(
      `Totais;${formatCurrency(Number(data.totals.revenues))};${formatCurrency(Number(data.totals.expenses))};${formatCurrency(Number(data.totals.result))}`
    );
    lines.push('');
    // Current tab details
    if (tab === 'classic' && (data as any).classic) {
      const c = (data as any).classic;
      lines.push('Estrutura clássica;;;');
      lines.push(`(+) Receita Total;;;${formatCurrency(Number(c.receita_total))}`);
      lines.push(`(-) Custos Variáveis;;;${formatCurrency(Number(c.custos_variaveis))}`);
      lines.push(`(=) Margem de Contribuição;;;${formatCurrency(Number(c.margem_contribuicao))}`);
      lines.push(`(-) Custos Fixos;;;${formatCurrency(Number(c.custos_fixos))}`);
      lines.push(`(=) Resultado Operacional Líquido;;;${formatCurrency(Number(c.resultado_operacional_liquido))}`);
      lines.push(`(-) Investimentos;;;${formatCurrency(Number(c.investimentos))}`);
      lines.push(`(-) Amortizações/Depreciações;;;${formatCurrency(Number(c.amortizacoes))}`);
      lines.push(`(=) Resultado Final;;;${formatCurrency(Number(c.resultado_final))}`);
    } else if (tab === 'monthly' && data.monthly) {
      lines.push('Mes;Receitas;Despesas;Resultado');
      data.monthly.forEach((m) => {
        lines.push(
          `${m.month};${formatCurrency(Number(m.revenues))};${formatCurrency(Number(m.expenses))};${formatCurrency(Number(m.result))}`
        );
      });
    } else if (tab === 'account' && data.by_account) {
      lines.push('Codigo;Nome;Receitas;Despesas;Total');
      data.by_account.forEach((a) => {
        const safeName = (a.name || '').replace(/;/g, ' ');
        lines.push(
          `${a.code};${safeName};${formatCurrency(Number(a.income))};${formatCurrency(Number(a.expense))};${formatCurrency(Number(a.total))}`
        );
      });
    } else if (tab === 'details' && (data as any).details_by_day) {
      const details = (data as any).details_by_day as Record<string, any[]>;
      lines.push('Data;Tipo;Descricao;Conta;Codigo;Metodo;Valor');
      Object.entries(details).forEach(([day, items]) => {
        items.forEach((it) => {
          const desc = (it.title_desc || '').replace(/;/g, ' ');
          const accName = (it.account_name || '').replace(/;/g, ' ');
          lines.push(
            `${day};${it.type};${desc};${accName};${it.account_code};${it.payment_method};${formatCurrency(Number(it.amount))}`
          );
        });
      });
    } else {
      // Default summary export when no specific tab: repeat totals and include breakdowns if present
      if (data.monthly) {
        lines.push('Mes;Receitas;Despesas;Resultado');
        data.monthly.forEach((m) => {
          lines.push(
            `${m.month};${formatCurrency(Number(m.revenues))};${formatCurrency(Number(m.expenses))};${formatCurrency(Number(m.result))}`
          );
        });
        lines.push('');
      }
      if (data.by_account) {
        lines.push('Codigo;Nome;Receitas;Despesas;Total');
        data.by_account.forEach((a) => {
          const safeName = (a.name || '').replace(/;/g, ' ');
          lines.push(
            `${a.code};${safeName};${formatCurrency(Number(a.income))};${formatCurrency(Number(a.expense))};${formatCurrency(Number(a.total))}`
          );
        });
        lines.push('');
      }
    }

    const csv = '\uFEFF' + lines.join('\n'); // Add BOM for Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const companyName = companies.find((c) => c.uuid === company)?.fantasy_name || 'empresa';
    a.download = `dre_${companyName}_${start}_a_${end}_${tab || 'resumo'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-background min-h-screen transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold">Relatório DRE</h1>
            <p className="text-text-muted">Demonstração do Resultado do Exercício</p>
          </div>

          <Card className="border-border bg-surface mb-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="company" className="text-text">
                  Empresa
                </Label>
                <Select id="company" value={company} onChange={(e) => setCompany(e.target.value)}>
                  <option value="">Selecionar</option>
                  {companies.map((c) => (
                    <option key={c.uuid} value={c.uuid}>
                      {c.fantasy_name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="start" className="text-text">
                  Início
                </Label>
                <input
                  id="start"
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="end" className="text-text">
                  Fim
                </Label>
                <input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full" />
              </div>

              <div>
                <Label htmlFor="group" className="text-text">
                  Agrupar por
                </Label>
                <Select id="group" value={group} onChange={(e) => setGroup(e.target.value as any)}>
                  <option value="">Nenhum</option>
                  <option value="month">Mês</option>
                  <option value="account">Conta (nível 1)</option>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="flex gap-2">
                {data && (
                  <Button color="gray" onClick={exportCSV} className="bg-muted hover:bg-muted-foreground/20">
                    Exportar CSV
                  </Button>
                )}
                <Button onClick={fetchReport} disabled={loading} className="btn-primary">
                  {loading ? 'Gerando…' : 'Gerar'}
                </Button>
              </div>
            </div>
          </Card>

          {data && (
            <div className="space-y-6">
              {/* Totals summary */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="border-border bg-surface">
                  <div className="text-text-muted text-sm">Receitas</div>
                  <div className="text-success text-2xl font-bold">
                    R$ {formatCurrency(Number(data.totals.revenues))}
                  </div>
                </Card>
                <Card className="border-border bg-surface">
                  <div className="text-text-muted text-sm">Despesas</div>
                  <div className="text-error text-2xl font-bold">R$ {formatCurrency(Number(data.totals.expenses))}</div>
                </Card>
                <Card className="border-border bg-surface">
                  <div className="text-text-muted text-sm">Resultado</div>
                  <div
                    className={`text-2xl font-bold ${Number(data.totals.result) >= 0 ? 'text-success' : 'text-error'}`}
                  >
                    R$ {formatCurrency(Number(data.totals.result))}
                  </div>
                </Card>
              </div>

              {/* Tabs for breakdowns */}
              {(data.monthly || data.by_account) && (
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button className="btn-primary" onClick={() => setTab('summary')}>
                      Resumo
                    </Button>
                    {(data as any).classic && (
                      <Button className="btn-primary" onClick={() => setTab('classic')}>
                        Estrutura clássica
                      </Button>
                    )}
                    {data.monthly && (
                      <Button className="btn-primary" onClick={() => setTab('monthly')}>
                        Por mês
                      </Button>
                    )}
                    {data.by_account && (
                      <Button className="btn-primary" onClick={() => setTab('account')}>
                        Por conta
                      </Button>
                    )}
                    {(data as any).details_by_day && (
                      <Button className="btn-primary" onClick={() => setTab('details')}>
                        Detalhes por dia
                      </Button>
                    )}
                  </div>
                  <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-medium">
                    {data.monthly
                      ? `${data.monthly.length} meses`
                      : data.by_account
                        ? `${data.by_account.length} contas`
                        : ''}
                  </span>
                </div>
              )}

              {/* Totals summary (only in Resumo tab) */}
              {tab === 'summary' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card className="border-border bg-surface">
                      <div className="text-text-muted text-sm">Receitas</div>
                      <div className="text-success text-2xl font-bold">
                        R$ {formatCurrency(Number(data.totals.revenues))}
                      </div>
                    </Card>
                    <Card className="border-border bg-surface">
                      <div className="text-text-muted text-sm">Despesas</div>
                      <div className="text-error text-2xl font-bold">
                        R$ {formatCurrency(Number(data.totals.expenses))}
                      </div>
                    </Card>
                    <Card className="border-border bg-surface">
                      <div className="text-text-muted text-sm">Resultado</div>
                      <div
                        className={`text-2xl font-bold ${Number(data.totals.result) >= 0 ? 'text-success' : 'text-error'}`}
                      >
                        R$ {formatCurrency(Number(data.totals.result))}
                      </div>
                    </Card>
                  </div>

                  {/* Summary bars (revenues vs expenses) */}
                  {summaryBars && (
                    <Card className="border-border bg-surface">
                      <div className="text-text mb-3 text-sm font-semibold">Comparativo receitas x despesas</div>
                      <div className="space-y-2">
                        <div className="text-text-muted text-xs">Receitas</div>
                        <div className="bg-success/20 h-3 w-full rounded">
                          <div className="bg-success h-3 rounded" style={{ width: `${summaryBars.revPct}%` }} />
                        </div>
                        <div className="text-text-muted text-xs">Despesas</div>
                        <div className="bg-error/20 h-3 w-full rounded">
                          <div className="bg-error h-3 rounded" style={{ width: `${summaryBars.expPct}%` }} />
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Monthly result line chart */}
                  {monthlyChart && (
                    <Card className="border-border bg-surface">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-text text-sm font-semibold">Resultado por mês</div>
                        <div className="text-text-muted text-xs">(R$)</div>
                      </div>
                      <div className="overflow-x-auto">
                        <svg width={monthlyChart.w} height={monthlyChart.h} className="max-w-full">
                          {/* axis */}
                          <line
                            x1={monthlyChart.pad}
                            y1={monthlyChart.toY(0)}
                            x2={monthlyChart.w - monthlyChart.pad}
                            y2={monthlyChart.toY(0)}
                            className="text-text-muted"
                            stroke="currentColor"
                            strokeDasharray="4 4"
                          />
                          {/* line */}
                          <path
                            d={monthlyChart.path}
                            fill="none"
                            className={Number(data.totals.result) >= 0 ? 'text-success' : 'text-error'}
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          {/* points */}
                          {data.monthly!.map((m, i) => (
                            <circle
                              key={m.month}
                              cx={monthlyChart.toX(i)}
                              cy={monthlyChart.toY(Number(m.result))}
                              r="3"
                              className={Number(m.result) >= 0 ? 'text-success' : 'text-error'}
                              fill="currentColor"
                            />
                          ))}
                          {/* labels */}
                          {monthlyChart.labels.map((lbl, i) => (
                            <text
                              key={lbl}
                              x={monthlyChart.toX(i)}
                              y={monthlyChart.h - 4}
                              textAnchor="middle"
                              fontSize="10"
                              className="text-text-muted"
                              fill="currentColor"
                            >
                              {lbl}
                            </text>
                          ))}
                        </svg>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Monthly table */}
              {tab === 'monthly' && data.monthly && (
                <Card className="border-border bg-surface">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-text text-lg font-semibold">Por mês</h2>
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-medium">
                      {data.monthly.length} meses
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="divide-border min-w-full divide-y">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Mês</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Receitas</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Despesas</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-border bg-surface divide-y">
                        {data.monthly.map((m) => (
                          <tr key={m.month}>
                            <td className="text-text px-4 py-2 font-medium whitespace-nowrap">{m.month}</td>
                            <td className="px-4 py-2">R$ {formatCurrency(Number(m.revenues))}</td>
                            <td className="px-4 py-2">R$ {formatCurrency(Number(m.expenses))}</td>
                            <td className="px-4 py-2">
                              <span className={`${Number(m.result) >= 0 ? 'text-success' : 'text-error'}`}>
                                R$ {formatCurrency(Number(m.result))}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Account table */}
              {tab === 'account' && data.by_account && (
                <Card className="border-border bg-surface">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-text text-lg font-semibold">Por conta (nível 1)</h2>
                    <span className="bg-primary/20 text-primary rounded px-2 py-1 text-xs font-medium">
                      {data.by_account.length} contas
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="divide-border min-w-full divide-y">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Código</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Nome</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Receitas</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Despesas</th>
                          <th className="text-text px-4 py-2 text-left text-sm font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-border bg-surface divide-y">
                        {data.by_account.map((acc) => (
                          <tr key={acc.code}>
                            <td className="text-text px-4 py-2 font-medium whitespace-nowrap">{acc.code}</td>
                            <td className="px-4 py-2">{acc.name}</td>
                            <td className="px-4 py-2">R$ {formatCurrency(Number(acc.income))}</td>
                            <td className="px-4 py-2">R$ {formatCurrency(Number(acc.expense))}</td>
                            <td className="px-4 py-2">
                              <span className={`${Number(acc.total) >= 0 ? 'text-success' : 'text-error'}`}>
                                R$ {formatCurrency(Number(acc.total))}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Classic DRE structure */}
              {tab === 'classic' && (data as any).classic && (
                <Card className="border-border bg-surface">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-text text-lg font-semibold">Estrutura clássica (DRE)</h2>
                    <span className="text-text-muted text-xs">Valores em R$</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">(+) Receita Total</span>
                      <span>{formatCurrency(Number((data as any).classic.receita_total))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">(-) Custos Variáveis</span>
                      <span>{formatCurrency(Number((data as any).classic.custos_variaveis))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">(=) Margem de Contribuição</span>
                      <span>{formatCurrency(Number((data as any).classic.margem_contribuicao))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">(-) Custos Fixos</span>
                      <span>{formatCurrency(Number((data as any).classic.custos_fixos))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">(=) Resultado Operacional Líquido</span>
                      <span>{formatCurrency(Number((data as any).classic.resultado_operacional_liquido))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">(-) Investimentos</span>
                      <span>{formatCurrency(Number((data as any).classic.investimentos))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">(-) Amortizações/Depreciações</span>
                      <span>{formatCurrency(Number((data as any).classic.amortizacoes))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">(=) Resultado Final</span>
                      <span
                        className={Number((data as any).classic.resultado_final) >= 0 ? 'text-success' : 'text-error'}
                      >
                        {formatCurrency(Number((data as any).classic.resultado_final))}
                      </span>
                    </div>
                  </div>
                </Card>
              )}

              {/* Details by day tab */}
              {tab === 'details' && (data as any).details_by_day && (
                <Card className="border-border bg-surface">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-text text-lg font-semibold">Detalhes por dia</h2>
                    <Button color="gray" onClick={exportCSV} className="bg-muted hover:bg-muted-foreground/20">
                      Exportar CSV
                    </Button>
                  </div>

                  {/* Filters specific to details */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    <Select value={detailTypeFilter} onChange={(e) => setDetailTypeFilter(e.target.value as any)}>
                      <option value="all">Tipo: Todos</option>
                      <option value="income">Tipo: Receitas</option>
                      <option value="expense">Tipo: Despesas</option>
                    </Select>
                    <Select value={detailMethodFilter} onChange={(e) => setDetailMethodFilter(e.target.value as any)}>
                      <option value="all">Método: Todos</option>
                      <option value="cash">Dinheiro</option>
                      <option value="debit">Débito</option>
                      <option value="credit">Crédito</option>
                      <option value="pix">PIX</option>
                    </Select>
                    <Select value={detailTopLevelFilter} onChange={(e) => setDetailTopLevelFilter(e.target.value)}>
                      <option value="all">Nível 1: Todos</option>
                      {Array.from(
                        new Set(
                          Object.values((data as any).details_by_day)
                            .flat()
                            .map((it: any) => it.top_level)
                            .filter(Boolean)
                        )
                      ).map((lvl) => (
                        <option key={String(lvl)} value={String(lvl)}>
                          {String(lvl)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  {/* Grouped by day with totals and items */}
                  <div className="space-y-4">
                    {Object.entries((data as any).details_by_day as Record<string, any[]>).map(([day, items]) => {
                      const filtered = items.filter((it) => {
                        const typeOk = detailTypeFilter === 'all' || it.type === detailTypeFilter;
                        const methodOk = detailMethodFilter === 'all' || it.payment_method === detailMethodFilter;
                        const levelOk = detailTopLevelFilter === 'all' || it.top_level === detailTopLevelFilter;
                        return typeOk && methodOk && levelOk;
                      });
                      const totals = filtered.reduce(
                        (acc, it) => {
                          const val = Number(it.amount) || 0;
                          if (it.type === 'income') acc.revenues += val;
                          else acc.expenses += val;
                          acc.result = acc.revenues - acc.expenses;
                          return acc;
                        },
                        { revenues: 0, expenses: 0, result: 0 }
                      );
                      return (
                        <div key={day} className="border-border rounded border p-3">
                          <div className="mb-2 flex items-center justify-between">
                            <div className="text-text text-sm font-semibold">{day}</div>
                            <div className="flex gap-4 text-xs">
                              <span className="text-success">Receitas: R$ {formatCurrency(totals.revenues)}</span>
                              <span className="text-error">Despesas: R$ {formatCurrency(totals.expenses)}</span>
                              <span className={`${totals.result >= 0 ? 'text-success' : 'text-error'}`}>
                                Resultado: R$ {formatCurrency(totals.result)}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="divide-border min-w-full divide-y">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="text-text px-4 py-2 text-left text-sm font-semibold">Tipo</th>
                                  <th className="text-text px-4 py-2 text-left text-sm font-semibold">Descrição</th>
                                  <th className="text-text px-4 py-2 text-left text-sm font-semibold">Conta</th>
                                  <th className="text-text px-4 py-2 text-left text-sm font-semibold">Código</th>
                                  <th className="text-text px-4 py-2 text-left text-sm font-semibold">Método</th>
                                  <th className="text-text px-4 py-2 text-left text-sm font-semibold">Valor</th>
                                </tr>
                              </thead>
                              <tbody className="divide-border bg-surface divide-y">
                                {filtered.map((it: any, idx: number) => (
                                  <tr key={`${day}-${idx}`}>
                                    <td className="text-text px-4 py-2 font-medium whitespace-nowrap">
                                      {it.type === 'income' ? 'Receita' : 'Despesa'}
                                    </td>
                                    <td className="px-4 py-2">{it.title_desc}</td>
                                    <td className="px-4 py-2">{it.account_name}</td>
                                    <td className="px-4 py-2">{it.account_code}</td>
                                    <td className="px-4 py-2">
                                      {it.payment_method?.toUpperCase?.() || it.payment_method}
                                    </td>
                                    <td className="px-4 py-2">R$ {formatCurrency(Number(it.amount))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
