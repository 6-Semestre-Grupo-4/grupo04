'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Label, Select } from 'flowbite-react';
// Minimal local ToastNotification component (fallback for missing external module)
function ToastNotification({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(() => onClose(), 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bgClass =
    type === 'success'
      ? 'bg-success'
      : type === 'error'
        ? 'bg-error'
        : type === 'warning'
          ? 'bg-warning'
          : 'bg-primary';

  return (
    <div className={`fixed right-4 bottom-4 z-50 rounded px-4 py-2 text-white shadow-lg ${bgClass}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1 text-sm">{message}</div>
        <button onClick={onClose} aria-label="Fechar" className="text-white opacity-90 hover:opacity-100">
          ✕
        </button>
      </div>
    </div>
  );
}
import companyService from '@/services/companyService';
import ledgerService, { LedgerResponse, LedgerAccount } from '@/services/ledgerService';
import api from '@/services/api';

interface CompanyOption {
  uuid: string;
  fantasy_name: string;
}

interface BillingAccountOption {
  uuid: string;
  code: string;
  name: string;
}

export default function LedgerReportPage() {
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [accounts, setAccounts] = useState<BillingAccountOption[]>([]);
  const [company, setCompany] = useState('');
  const [account, setAccount] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Filtros para movimentações
  const [movementTypeFilter, setMovementTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [accountCodeFilter, setAccountCodeFilter] = useState<string>('all');

  const formatCurrency = (v: string | number | undefined) => {
    if (v === undefined || v === null) return '0.00';
    const num = typeof v === 'string' ? Number(v) : v;
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Função para tratar datas como locais (evita problemas de timezone)
  const parseLocalDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00');
  };

  // Carrega empresas
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

  // Carrega contas quando empresa for selecionada
  useEffect(() => {
    const loadAccounts = async () => {
      if (!company) {
        setAccounts([]);
        return;
      }
      try {
        // Faz uma requisição de teste para o relatório para obter as contas com movimentações
        const testParams = { company, start: '1900-01-01', end: '2100-12-31' };
        const res = await ledgerService.getLedger(testParams);
        const accountsWithMovements = res.accounts.map((acc) => ({
          uuid: acc.account_id,
          code: acc.code,
          name: acc.name,
        }));
        setAccounts(accountsWithMovements);
      } catch (e) {
        console.error('Erro ao carregar contas:', e);
        setAccounts([]);
      }
    };
    loadAccounts();
  }, [company]);

  const fetchReport = async () => {
    if (!company || !start || !end) {
      setToast({ message: 'Selecione empresa e período (início e fim).', type: 'warning' });
      return;
    }
    setLoading(true);
    setData(null);
    setExpandedAccounts(new Set());
    try {
      const params = { company, start, end, account: account || undefined } as any;
      const res = await ledgerService.getLedger(params);
      setData(res);

      // Pré-expande contas se houver apenas uma
      if (res.accounts.length === 1) {
        setExpandedAccounts(new Set([res.accounts[0].account_id]));
      }
    } catch (error: any) {
      const respData = error?.response?.data;
      let message = 'Erro ao gerar Razão.';
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

  const toggleAccountExpanded = (accountId: string) => {
    const newSet = new Set(expandedAccounts);
    if (newSet.has(accountId)) {
      newSet.delete(accountId);
    } else {
      newSet.add(accountId);
    }
    setExpandedAccounts(newSet);
  };

  const exportCSV = () => {
    if (!data) return;
    const lines: string[] = [];

    // Cabeçalho
    lines.push(`Empresa;${data.company}`);
    lines.push(`Período;${data.start} a ${data.end}`);
    lines.push('');

    // Resumo
    lines.push('Resumo');
    lines.push(`Total de Contas;${data.summary.accounts_count}`);
    lines.push(`Total de Movimentações;${data.summary.total_movements}`);
    lines.push(`Total de Débitos;${formatCurrency(data.summary.total_debits)}`);
    lines.push(`Total de Créditos;${formatCurrency(data.summary.total_credits)}`);
    lines.push(`Resultado Líquido;${formatCurrency(data.summary.net_result)}`);
    lines.push('');

    // Detalhes por conta
    data.accounts.forEach((acc) => {
      lines.push(`Conta;${acc.code} - ${acc.name}`);
      lines.push(`Tipo;${acc.account_type}`);
      lines.push(`Saldo Inicial;${formatCurrency(acc.initial_balance)}`);
      lines.push(`Total Débitos;${formatCurrency(acc.total_debits)}`);
      lines.push(`Total Créditos;${formatCurrency(acc.total_credits)}`);
      lines.push(`Saldo Final;${formatCurrency(acc.final_balance)}`);
      lines.push('');

      if (acc.movements.length > 0) {
        lines.push('Data;Descrição;Tipo;Débito;Crédito;Saldo Acumulado;Método');
        acc.movements.forEach((mov) => {
          const desc = (mov.description || '').replace(/;/g, ' ');
          lines.push(
            `${mov.date};${desc};${mov.type};${formatCurrency(mov.debit)};${formatCurrency(mov.credit)};${formatCurrency(mov.accumulated_balance)};${mov.payment_method}`
          );
        });
      }
      lines.push('');
    });

    const csv = '\uFEFF' + lines.join('\n'); // Add BOM for Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const companyName = companies.find((c) => c.uuid === company)?.fantasy_name || 'empresa';
    a.download = `razao_${companyName}_${start}_a_${end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredAccounts = (): LedgerAccount[] => {
    if (!data) return [];

    return data.accounts.filter((acc) => {
      const codeOk = accountCodeFilter === 'all' || acc.code === accountCodeFilter;
      return codeOk;
    });
  };

  const getFilteredMovements = (movements: any[]) => {
    return movements.filter((mov) => {
      const typeOk = movementTypeFilter === 'all' || mov.type === movementTypeFilter;
      // Filtro por data: só exibe movimentações dentro do período
      const dateOk = !start || !end || (mov.date >= start && mov.date <= end);
      return typeOk && dateOk;
    });
  };

  const filteredAccounts = getFilteredAccounts();
  const uniqueAccountCodes = data ? Array.from(new Set(data.accounts.map((a) => a.code))).sort() : [];

  // Calcula totais baseados nas contas filtradas
  const getFilteredSummary = () => {
    if (!data || filteredAccounts.length === 0) return data?.summary || {};

    const totalDebits = filteredAccounts.reduce((sum, acc) => sum + Number(acc.total_debits), 0);
    const totalCredits = filteredAccounts.reduce((sum, acc) => sum + Number(acc.total_credits), 0);
    const totalMovements = filteredAccounts.reduce((sum, acc) => sum + acc.movements_count, 0);

    return {
      accounts_count: filteredAccounts.length,
      total_movements: totalMovements,
      total_debits: totalDebits || 0,
      total_credits: totalCredits || 0,
      net_result: (totalCredits || 0) - (totalDebits || 0),
    };
  };

  const summary = getFilteredSummary();

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-foreground">Relatório de Razão</h1>
            <p className="text-text-muted">
              Visualize o histórico detalhado de movimentações por conta contábil
            </p>
          </div>

          <Card className="mb-6 border-border bg-surface">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <div>
                <Label htmlFor="company" className="text-text">
                  Empresa
                </Label>
                <Select
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                >
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
                <input
                  id="end"
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="account" className="text-text">
                  Conta (opcional)
                </Label>
                <Select
                  id="account"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  className="w-full"
                  disabled={loading}
                >
                  <option value="">Todas as contas</option>
                  {Array.isArray(accounts) &&
                    accounts.map((acc) => (
                      <option key={acc.uuid} value={acc.uuid}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                </Select>
              </div>

              <div className="flex items-end">
                <Button onClick={fetchReport} disabled={loading} className="btn-primary w-full">
                  {loading ? 'Gerando…' : 'Gerar'}
                </Button>
              </div>
            </div>
          </Card>

          {data && (
            <div className="space-y-6">
              {/* Resumo */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                <Card className="border-border bg-surface">
                  <div className="text-sm text-text-muted">Contas</div>
                  <div className="text-2xl font-bold text-primary">
                    {data.summary.accounts_count}
                  </div>
                </Card>
                <Card className="border-border bg-surface">
                  <div className="text-sm text-text-muted">Movimentações</div>
                  <div className="text-2xl font-bold text-primary">
                    {data.summary.total_movements}
                  </div>
                </Card>
                <Card className="border-border bg-surface">
                  <div className="text-sm text-text-muted">Total Débitos</div>
                  <div className="text-2xl font-bold text-error">
                    R$ {formatCurrency(data.summary.total_debits)}
                  </div>
                </Card>
                <Card className="border-border bg-surface">
                  <div className="text-sm text-text-muted">Total Créditos</div>
                  <div className="text-2xl font-bold text-success">
                    R$ {formatCurrency(data.summary.total_credits)}
                  </div>
                </Card>
                <Card className="border-border bg-surface">
                  <div className="text-sm text-text-muted">Resultado Líquido</div>
                  <div
                    className={`text-2xl font-bold ${Number(data.summary.net_result) >= 0
                      ? 'text-success'
                      : 'text-error'
                      }`}
                  >
                    R$ {formatCurrency(data.summary.net_result)}
                  </div>
                </Card>
              </div>

              {/* Filtros e Exportar */}
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:gap-4">
                  {uniqueAccountCodes.length > 0 && (
                    <div>
                      <Label htmlFor="filter-account-code" className="text-sm text-text">
                        Filtrar por Conta
                      </Label>
                      <Select
                        id="filter-account-code"
                        value={accountCodeFilter}
                        onChange={(e) => setAccountCodeFilter(e.target.value)}
                      >
                        <option value="all">Todas</option>
                        {uniqueAccountCodes.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="filter-type" className="text-sm text-text">
                      Filtrar por Tipo
                    </Label>
                    <Select
                      id="filter-type"
                      value={movementTypeFilter}
                      onChange={(e) => setMovementTypeFilter(e.target.value as any)}
                    >
                      <option value="all">Todos</option>
                      <option value="income">Créditos</option>
                      <option value="expense">Débitos</option>
                    </Select>
                  </div>
                </div>

                <Button color="gray" onClick={exportCSV} className="bg-muted hover:bg-muted-foreground/20">
                  Exportar CSV
                </Button>
              </div>

              {/* Contas e Movimentações */}
              <div className="space-y-4">
                {filteredAccounts.length === 0 ? (
                  <Card className="border-border bg-surface">
                    <p className="text-text-muted">
                      Nenhuma conta encontrada com os filtros selecionados.
                    </p>
                  </Card>
                ) : (
                  filteredAccounts.map((acc) => (
                    <Card
                      key={acc.account_id}
                      className="border-border bg-surface"
                    >
                      {/* Header da Conta */}
                      <div
                        className="-m-3 cursor-pointer rounded p-3 transition-colors hover:bg-muted"
                        onClick={() => toggleAccountExpanded(acc.account_id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-text">
                              {acc.code} - {acc.name}
                            </h3>
                            <p className="mt-1 text-xs text-text-muted">
                              Tipo: {acc.account_type === 'analytic' ? 'Analítica' : 'Sintética'} •{' '}
                              {acc.movements_count} movimentações
                            </p>
                          </div>
                          <div className="mr-4 text-right">
                            <div className="mb-1 text-xs text-text-muted">Saldo Inicial</div>
                            <div className="text-sm font-medium text-text">
                              R$ {formatCurrency(acc.initial_balance)}
                            </div>
                          </div>
                          <div className="mr-4 text-right">
                            <div className="mb-1 text-xs text-text-muted">Saldo Final</div>
                            <div
                              className={`text-sm font-bold ${Number(acc.final_balance) >= 0
                                ? 'text-success'
                                : 'text-error'
                                }`}
                            >
                              R$ {formatCurrency(acc.final_balance)}
                            </div>
                          </div>
                          <div className="text-text-muted">{expandedAccounts.has(acc.account_id) ? '▼' : '▶'}</div>
                        </div>
                      </div>

                      {/* Resumo da Conta */}
                      <div className="mt-3 border-t border-border pt-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <div className="text-xs text-text-muted">Débitos</div>
                            <div className="text-sm font-medium text-error">
                              R$ {formatCurrency(acc.total_debits)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-muted">Créditos</div>
                            <div className="text-sm font-medium text-success">
                              R$ {formatCurrency(acc.total_credits)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-text-muted">Variação</div>
                            <div
                              className={`text-sm font-medium ${Number(acc.total_credits) - Number(acc.total_debits) >= 0
                                ? 'text-success'
                                : 'text-error'
                                }`}
                            >
                              R$ {formatCurrency(Number(acc.total_credits) - Number(acc.total_debits))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Movimentações */}
                      {expandedAccounts.has(acc.account_id) && acc.movements.length > 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-border">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-text">
                                    Data
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-text">
                                    Descrição
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-semibold text-text">
                                    Débito
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-semibold text-text">
                                    Crédito
                                  </th>
                                  <th className="px-3 py-2 text-right text-xs font-semibold text-text">
                                    Saldo
                                  </th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-text">
                                    Método
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border bg-surface">
                                {getFilteredMovements(acc.movements).map((mov, idx) => (
                                  <tr
                                    key={`${acc.account_id}-${idx}`}
                                    className="hover:bg-muted"
                                  >
                                    <td className="px-3 py-2 text-xs whitespace-nowrap text-text">
                                      {new Date(mov.date).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-text-muted">
                                      {mov.description}
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs text-error">
                                      {Number(mov.debit) > 0 ? `R$ ${formatCurrency(mov.debit)}` : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs text-success">
                                      {Number(mov.credit) > 0 ? `R$ ${formatCurrency(mov.credit)}` : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-right text-xs font-medium text-text">
                                      R$ {formatCurrency(mov.accumulated_balance)}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-text-muted capitalize">
                                      {mov.payment_method}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {expandedAccounts.has(acc.account_id) && acc.movements.length === 0 && (
                        <div className="mt-3 border-t border-border pt-3">
                          <p className="text-sm text-text-muted">Nenhuma movimentação encontrada.</p>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
