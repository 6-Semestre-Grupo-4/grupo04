import api from './api';

export interface CompanyData {
  cnpj: string;
  fantasy_name: string;
  social_reason: string;
  opening_date: string;
  cnae: string;
  email: string;
  phone: string;
  mobile_phone: string;
  state_registration: string;
  municipal_registration: string;
  tax_regime: string;
  logo?: File | null;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
  };
}

export const companyService = {
  // Criar nova empresa
  create: async (companyData: CompanyData) => {
    // TODO: Descomentar quando backend estiver pronto
    /*
    const formData = new FormData();
    
    // Adicionar campos de empresa
    Object.entries(companyData).forEach(([key, value]) => {
      if (key === 'address') {
        // Serializar o endereço como JSON ou enviar campos separados
        Object.entries(value).forEach(([addressKey, addressValue]) => {
          formData.append(`address.${addressKey}`, String(addressValue));
        });
      } else if (key === 'logo' && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    });

    const response = await api.post('/companies/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
    */

    // Mock response
    return {
      uuid: Date.now().toString(),
      ...companyData,
      created_at: new Date().toISOString(),
    };
  },

  // Listar todas as empresas
  getAll: async () => {
    // TODO: Descomentar quando backend estiver pronto
    /*
    const response = await api.get('/companies/');
    return response.data;
    */

    // Mock response
    return [];
  },

  // Buscar empresa por ID
  getById: async (id: string) => {
    // TODO: Descomentar quando backend estiver pronto
    /*
    const response = await api.get(`/companies/${id}/`);
    return response.data;
    */

    // Mock response
    return null;
  },

  // Atualizar empresa
  update: async (id: string, companyData: Partial<CompanyData>) => {
    // TODO: Descomentar quando backend estiver pronto
    /*
    const formData = new FormData();
    
    // Adicionar campos de empresa
    Object.entries(companyData).forEach(([key, value]) => {
      if (key === 'address' && value) {
        // Serializar o endereço como JSON ou enviar campos separados
        Object.entries(value).forEach(([addressKey, addressValue]) => {
          formData.append(`address.${addressKey}`, String(addressValue));
        });
      } else if (key === 'logo' && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'string') {
        formData.append(key, value);
      }
    });

    const response = await api.put(`/companies/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
    */

    // Mock response
    return { id, ...companyData, updated_at: new Date().toISOString() };
  },

  // Deletar empresa
  delete: async (id: string) => {
    // TODO: Descomentar quando backend estiver pronto
    /*
    const response = await api.delete(`/companies/${id}/`);
    return response.data;
    */

    // Mock response
    return { success: true };
  },
};

export default companyService;
