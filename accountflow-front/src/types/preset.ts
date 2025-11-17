export interface Preset {
  uuid: string;
  name: string;
  description: string;
  payable_account: string;
  receivable_account: string;
  payable_name?: string;
  receivable_name?: string;
  billing_plan: string;
  active: boolean;
}
