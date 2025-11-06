export interface Title {
  uuid: string;
  description: string;
  type_of: 'income' | 'expense';
  amount: number;
  expiration_date: string;
  fees_percentage_monthly?: number;
  installments?: number;
  active: boolean;
  recorrence: boolean;
  recorrence_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  company: string;
  created_at?: string;
  updated_at?: string;
}