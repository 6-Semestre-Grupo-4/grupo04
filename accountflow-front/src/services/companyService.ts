import api from './api';

export interface CompanyAddress {
  cep?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  uuid?: string; // when coming from server
}

export interface CompanyData {
  cnpj: string;
  fantasy_name: string;
  social_reason: string;
  opening_date: string;
  cnae: string;
  email: string;
  phone?: string;
  state_registration?: string;
  municipal_registration?: string;
  tax_regime?: string;
  logo?: File | null;
  address?: CompanyAddress;
  type_of?: string; // 'Client' | 'Supplier'
}

const mapAddressToApi = (address: CompanyAddress) => ({
  zip_code: address.cep || '',
  street: address.street || '',
  number: address.number || '',
  complement: address.complement || '',
  neighborhood: address.neighborhood || '',
  city: address.city || '',
  state: address.state || '',
});

const mapAddressFromApi = (addr: any): CompanyAddress => ({
  cep: addr?.zip_code || '',
  street: addr?.street || '',
  number: addr?.number || '',
  complement: addr?.complement || '',
  neighborhood: addr?.neighborhood || '',
  city: addr?.city || '',
  state: addr?.state || '',
  uuid: addr?.uuid || addr?.id || undefined,
});

export const companyService = {
  // Create company (creates address first if provided as object)
  create: async (companyData: CompanyData) => {
    // Create address first if provided as object without uuid
    let addressUuid: string | undefined;

    if (companyData.address) {
      if ((companyData.address as any).uuid) {
        addressUuid = (companyData.address as any).uuid;
      } else {
        const addressPayload = mapAddressToApi(companyData.address);
        const addrRes = await api.post('/address/', addressPayload);
        addressUuid = addrRes.data.uuid || addrRes.data.id;
      }
    }

    const formData = new FormData();
    formData.append('cnpj', companyData.cnpj);
    formData.append('fantasy_name', companyData.fantasy_name);
    formData.append('social_reason', companyData.social_reason);
    formData.append('opening_date', companyData.opening_date);
    formData.append('cnae', companyData.cnae);
    if (companyData.email) formData.append('email', companyData.email);
    if (companyData.phone) formData.append('phone', companyData.phone);
    if (companyData.mobile_phone) formData.append('mobile_phone', companyData.mobile_phone);
    if (companyData.state_registration) formData.append('state_registration', companyData.state_registration);
    if (companyData.municipal_registration)
      formData.append('municipal_registration', companyData.municipal_registration);
    if (companyData.tax_regime) formData.append('tax_regime', companyData.tax_regime);

    // required by model: type_of
    formData.append('type_of', companyData.type_of || 'Client');

    if (addressUuid) formData.append('address', String(addressUuid));

    if (companyData.logo instanceof File) {
      formData.append('logo', companyData.logo);
    }

    const response = await api.post('/company/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  // List companies and hydrate address fields (city/state) by fetching address details
  getAll: async () => {
    const res = await api.get('/company/');
    const companies = res.data || [];

    // collect unique address uuids
    const addressUuids = Array.from(new Set(companies.map((c: any) => c.address).filter(Boolean)));

    const addressMap: Record<string, any> = {};
    if (addressUuids.length > 0) {
      const addrPromises = addressUuids.map((u) =>
        api
          .get(`/address/${u}/`)
          .then((r) => ({ uuid: u, data: r.data }))
          .catch(() => null)
      );
      const addrResults = await Promise.all(addrPromises);
      addrResults.forEach((r: any) => {
        if (r && r.uuid) addressMap[r.uuid] = mapAddressFromApi(r.data);
      });
    }

    // attach hydrated address (city/state) when available
    const hydrated = companies.map((c: any) => ({
      ...c,
      address:
        addressMap[c.address] ||
        (typeof c.address === 'object' ? mapAddressFromApi(c.address) : { city: '', state: '', uuid: c.address }),
    }));

    return hydrated;
  },

  // Get company by id, hydrate address object
  getById: async (id: string) => {
    const res = await api.get(`/company/${id}/`);
    const company = res.data;

    if (company && company.address) {
      if (typeof company.address === 'string') {
        try {
          const addrRes = await api.get(`/address/${company.address}/`);
          company.address = mapAddressFromApi(addrRes.data);
        } catch (err) {
          company.address = { city: '', state: '', uuid: company.address };
        }
      } else {
        company.address = mapAddressFromApi(company.address);
      }
    }

    return company;
  },

  // Update company
  update: async (id: string, companyData: Partial<CompanyData>) => {
    // If address is provided as object without uuid, create address first
    let addressUuid: string | undefined;
    if (companyData.address) {
      if ((companyData.address as any).uuid) {
        addressUuid = (companyData.address as any).uuid;
      } else {
        const addrRes = await api.post('/address/', mapAddressToApi(companyData.address as CompanyAddress));
        addressUuid = addrRes.data.uuid || addrRes.data.id;
      }
    }

    const formData = new FormData();
    if (companyData.cnpj) formData.append('cnpj', companyData.cnpj);
    if (companyData.fantasy_name) formData.append('fantasy_name', companyData.fantasy_name);
    if (companyData.social_reason) formData.append('social_reason', companyData.social_reason);
    if (companyData.opening_date) formData.append('opening_date', companyData.opening_date);
    if (companyData.cnae) formData.append('cnae', companyData.cnae);
    if (companyData.email) formData.append('email', companyData.email);
    if (companyData.phone) formData.append('phone', companyData.phone as string);
    if (companyData.mobile_phone) formData.append('mobile_phone', companyData.mobile_phone as string);
    if (companyData.state_registration) formData.append('state_registration', companyData.state_registration as string);
    if (companyData.municipal_registration)
      formData.append('municipal_registration', companyData.municipal_registration as string);
    if (companyData.tax_regime) formData.append('tax_regime', companyData.tax_regime as string);
    if (companyData.type_of) formData.append('type_of', companyData.type_of as string);
    if (addressUuid) formData.append('address', String(addressUuid));
    if (companyData.logo instanceof File) formData.append('logo', companyData.logo as File);

    const response = await api.put(`/company/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data;
  },

  // Delete company
  delete: async (id: string) => {
    const res = await api.delete(`/company/${id}/`);
    return res.data;
  },
};

export default companyService;
