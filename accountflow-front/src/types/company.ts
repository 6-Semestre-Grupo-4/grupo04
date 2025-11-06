import { Address } from './address';
export type Company = {
  uuid: string;
  CNPJ: string;
  fantasy_name: string;
  social_reason: string;
  opening_date: Date;
  logo: string;
  cnae: string;
  address: Address;
  type_of: ['Client', 'Supplier', 'Both'];
  email: string;
  phone: string;
};
