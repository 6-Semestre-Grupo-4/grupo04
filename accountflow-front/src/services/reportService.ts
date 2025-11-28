import api from './api';

export type DREParams = {
  company: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  group?: 'account' | 'month';
};

export type DRETotals = {
  revenues: string;
  expenses: string;
  result: string;
};

export type DREByAccount = Array<{
  code: string;
  name: string;
  income: string;
  expense: string;
  total: string;
}>;

export type DREMonthly = Array<{
  month: string; // YYYY-MM
  revenues: string;
  expenses: string;
  result: string;
}>;

export type DREResponse = {
  company: string;
  start: string;
  end: string;
  totals: DRETotals;
  by_account?: DREByAccount;
  monthly?: DREMonthly;
  classic?: {
    receita_total: string;
    custos_variaveis: string;
    margem_contribuicao: string;
    custos_fixos: string;
    resultado_operacional_liquido: string;
    investimentos: string;
    amortizacoes: string;
    resultado_final: string;
  };
  details_by_day?: Record<
    string,
    Array<{
      paid_at: string;
      type: 'income' | 'expense';
      amount: string;
      payment_method: 'cash' | 'debit' | 'credit' | 'pix';
      account_code: string;
      account_name: string;
      top_level: string;
      title_desc: string;
    }>
  >;
};

export const reportService = {
  async getDRE(params: DREParams) {
    const res = await api.get<DREResponse>('/reports/dre/', { params });
    return res.data;
  },
};

export default reportService;
