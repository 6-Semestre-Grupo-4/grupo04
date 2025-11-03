export type BillingAccount = {
  uuid: string;
  name: string;
  account_type: 'analytic' | 'synthetic' | null;
  code: string;
  parent: string | null;
  company: string;
  billing_plan: string;
  billingAccount_parent?: BillingAccount[];
};
