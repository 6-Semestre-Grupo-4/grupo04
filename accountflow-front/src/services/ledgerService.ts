import api from './api';

export type LedgerParams = {
  company: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  account?: string; // UUID opcional
};

export type LedgerMovement = {
  date: string; // ISO date
  description: string;
  type: 'income' | 'expense';
  amount: string;
  debit: string;
  credit: string;
  accumulated_balance: string;
  payment_method: 'cash' | 'debit' | 'credit' | 'pix';
  entry_id: string;
};

export type LedgerAccount = {
  account_id: string;
  code: string;
  name: string;
  account_type: 'analytic' | 'synthetic';
  initial_balance: string;
  total_debits: string;
  total_credits: string;
  final_balance: string;
  movements_count: number;
  movements: LedgerMovement[];
};

export type LedgerSummary = {
  accounts_count: number;
  total_movements: number;
  total_debits: string;
  total_credits: string;
  net_result: string;
};

export type LedgerResponse = {
  company: string;
  start: string;
  end: string;
  accounts: LedgerAccount[];
  summary: LedgerSummary;
};

export const ledgerService = {
  async getLedger(params: LedgerParams) {
    const res = await api.get<LedgerResponse>('/reports/ledger/', { params });
    return res.data;
  },
};

export default ledgerService;
