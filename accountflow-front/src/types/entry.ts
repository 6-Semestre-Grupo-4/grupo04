export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'pix';

export type Entry = {
  uuid: string;
  title: string; // FK para Title.uuid
  description: string;
  type_of: 'income' | 'expense';
  amount: number;
  paid_at: string | null; // campo do backend é 'paid_at'
  payment_method: PaymentMethod;
  billing_account: string | null; // FK para BillingAccount.uuid
  created_at: string;
};

export type EntryPayload = {
  title: string;
  description: string;
  amount: number;
  paid_at: string | null;
  type_of: 'income' | 'expense';
  payment_method: PaymentMethod;
  billing_account?: string;
};
