export interface Preset {
    uuid: string;
    name: string;
    description: string;
    payable_account: string | null;
    receivable_account: string | null;
  
    payable_account_name?: string;
    receivable_account_name?: string;
    revenue_account_name?: string;
    expense_account_name?: string;
  
    revenue_account?: string | null;
    expense_account?: string | null;

    payable_name?: string;
    receivable_name?: string;
  
    billing_plan: string | null;
    active: boolean;
  }