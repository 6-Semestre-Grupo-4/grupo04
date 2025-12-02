'use client';

import { useState, useEffect } from 'react';
import companyService from '@/services/companyService';
import ToastNotification from '@/components/utils/toastNotification';
import { Card, Label, TextInput, Select, Button, FileInput } from 'flowbite-react';
import { FiSave, FiUpload } from 'react-icons/fi';
import { useParams, useRouter } from 'next/navigation';

const applyMask = (value: string, mask: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  let maskedValue = '';
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
    if (mask[i] === '9') {
      maskedValue += cleanValue[valueIndex];
      valueIndex++;
    } else {
      maskedValue += mask[i];
    }
  }

  return maskedValue;
};

interface CompanyPayload {
  uuid?: string;
  cnpj: string;
  fantasy_name: string;
  social_reason: string;
  opening_date: string;
  cnae: string;
  email: string;
  phone: string;

  state_registration: string;
  municipal_registration: string;
  tax_regime: string;
  type_of?: string;

  logo: File | null;

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

export default function CompanyEdit() {
  const params = useParams();
  const router = useRouter();
  const companyId = params?.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [formData, setFormData] = useState<CompanyPayload>({
    cnpj: '',
    fantasy_name: '',
    social_reason: '',
    opening_date: '',
    cnae: '',
    email: '',
    phone: '',
    state_registration: '',
    municipal_registration: '',
    tax_regime: '',
    logo: null,
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
    },
  });

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!companyId) return;

      try {
        setIsLoadingData(true);
        const company = await companyService.getById(companyId);

        if (company) {
          // map server company -> form structure, address is already hydrated by service
          setFormData((prev) => ({
            ...prev,
            uuid: company.uuid,
            cnpj: company.cnpj || prev.cnpj,
            fantasy_name: company.fantasy_name || prev.fantasy_name,
            social_reason: company.social_reason || prev.social_reason,
            opening_date: company.opening_date || prev.opening_date,
            cnae: company.cnae || prev.cnae,
            email: company.email || prev.email,
            phone: company.phone || prev.phone,
            state_registration: company.state_registration || prev.state_registration,
            municipal_registration: company.municipal_registration || prev.municipal_registration,
            tax_regime: company.tax_regime || prev.tax_regime,
            type_of: company.type_of || prev.type_of,
            address: {
              cep: company.address?.cep || prev.address.cep,
              street: company.address?.street || prev.address.street,
              number: company.address?.number || prev.address.number,
              complement: company.address?.complement || prev.address.complement,
              neighborhood: company.address?.neighborhood || prev.address.neighborhood,
              city: company.address?.city || prev.address.city,
              state: company.address?.state || prev.address.state,
            },
          }));
        }
      } catch (error: any) {
        const respData = error?.response?.data;
        let message = 'Erro ao carregar dados da empresa.';
        if (respData) {
          if (typeof respData === 'string') message = respData;
          else if (typeof respData === 'object') {
            message = Object.entries(respData)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
              .join(' | ');
          }
        }
        setToast({ message, type: 'error' });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadCompanyData();
  }, [companyId]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      logo: file,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await companyService.update(companyId, formData as any);

      setToast({ message: 'Empresa atualizada com sucesso!', type: 'success' });
      setTimeout(() => router.push('/pages/company'), 800);
    } catch (error) {
      const respData = (error as any)?.response?.data;
      let message = 'Erro ao atualizar empresa. Tente novamente.';
      if (respData) {
        if (typeof respData === 'string') message = respData;
        else if (typeof respData === 'object') {
          message = Object.entries(respData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
            .join(' | ');
        }
      }
      setToast({ message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const taxRegimeOptions = [
    { value: '', label: 'Selecione um regime tributário' },
    { value: 'simples_nacional', label: 'Simples Nacional' },
    { value: 'lucro_presumido', label: 'Lucro Presumido' },
    { value: 'lucro_real', label: 'Lucro Real' },
  ];

  const typeOfOptions = [
    { value: '', label: 'Selecione um tipo' },
    { value: 'Client', label: 'Cliente' },
    { value: 'Supplier', label: 'Fornecedor' },
    { value: 'Both', label: 'Ambos' },
  ];

  const brazilianStates = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];

  if (isLoadingData) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-12 w-12 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen transition-colors duration-200">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container mx-auto px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2">
            <h1 className="text-foreground mb-2 text-3xl font-bold">Editar Empresa</h1>
            <p className="text-text-muted">Atualize as informações da empresa abaixo.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-surface border-border">
              <div className="mb-4">
                <h2 className="text-foreground text-xl font-semibold">Informações da Empresa</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <Label htmlFor="cnpj" className="text-text">
                    CNPJ *
                  </Label>
                  <TextInput
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => {
                      const maskedValue = applyMask(e.target.value, '99.999.999/9999-99');
                      handleInputChange('cnpj', maskedValue);
                    }}
                    placeholder="00.000.000/0000-00"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="social_reason" className="text-text">
                    Razão Social *
                  </Label>
                  <TextInput
                    id="social_reason"
                    name="social_reason"
                    value={formData.social_reason}
                    onChange={(e) => handleInputChange('social_reason', e.target.value)}
                    placeholder="Informe a razão social da empresa"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="fantasy_name" className="text-text">
                    Nome Fantasia *
                  </Label>
                  <TextInput
                    id="fantasy_name"
                    name="fantasy_name"
                    value={formData.fantasy_name}
                    onChange={(e) => handleInputChange('fantasy_name', e.target.value)}
                    placeholder="Informe o nome fantasia"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="opening_date" className="text-text">
                    Data de Abertura *
                  </Label>
                  <TextInput
                    id="opening_date"
                    name="opening_date"
                    type="date"
                    value={formData.opening_date}
                    onChange={(e) => handleInputChange('opening_date', e.target.value)}
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="cnae" className="text-text">
                    CNAE *
                  </Label>
                  <TextInput
                    id="cnae"
                    name="cnae"
                    value={formData.cnae}
                    onChange={(e) => handleInputChange('cnae', e.target.value)}
                    placeholder="0000-0/00"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="tax_regime" className="text-text">
                    Regime Tributário *
                  </Label>
                  <Select
                    id="tax_regime"
                    name="tax_regime"
                    value={formData.tax_regime}
                    onChange={(e) => handleInputChange('tax_regime', e.target.value)}
                    className="text-foreground"
                    required
                  >
                    {taxRegimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="lg:col-span-3">
                  <Label htmlFor="type_of" className="text-text">
                    Tipo de cliente *
                  </Label>
                  <Select
                    id="type_of"
                    name="type_of"
                    value={formData.type_of}
                    onChange={(e) => handleInputChange('type_of', e.target.value)}
                    className="text-foreground"
                    required
                  >
                    {typeOfOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="bg-surface border-border">
              <div className="mb-4">
                <h2 className="text-foreground text-xl font-semibold">Endereço</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <Label htmlFor="cep" className="text-text">
                    CEP *
                  </Label>
                  <TextInput
                    id="cep"
                    name="cep"
                    value={formData.address.cep}
                    onChange={(e) => {
                      const maskedValue = applyMask(e.target.value, '99999-999');
                      handleInputChange('address.cep', maskedValue);
                    }}
                    placeholder="00000-000"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="street" className="text-text">
                    Logradouro *
                  </Label>
                  <TextInput
                    id="street"
                    name="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Informe o logradouro"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="state" className="text-text">
                    Estado (UF) *
                  </Label>
                  <Select
                    id="state"
                    name="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    className="text-foreground"
                    required
                  >
                    <option value="">Selecionar</option>
                    {brazilianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="number" className="text-text">
                    Número *
                  </Label>
                  <TextInput
                    id="number"
                    name="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    placeholder="123"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="complement" className="text-text">
                    Complemento
                  </Label>
                  <TextInput
                    id="complement"
                    name="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    placeholder="Apto, sala, etc."
                    className="text-foreground"
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="neighborhood" className="text-text">
                    Bairro *
                  </Label>
                  <TextInput
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                    placeholder="Informe o bairro"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="city" className="text-text">
                    Cidade *
                  </Label>
                  <TextInput
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="Informe a cidade"
                    className="text-foreground"
                    required
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-surface border-border">
              <div className="mb-4">
                <h2 className="text-foreground text-xl font-semibold">Contato</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-1">
                  <Label htmlFor="email" className="text-text">
                    Email Principal *
                  </Label>
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="empresa@exemplo.com"
                    className="text-foreground"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="phone" className="text-text">
                    Telefone
                  </Label>
                  <TextInput
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const maskedValue = applyMask(e.target.value, '(99) 9999-9999');
                      handleInputChange('phone', maskedValue);
                    }}
                    placeholder="(45) 99999-9999"
                    className="text-foreground"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-surface border-border">
              <div className="mb-2">
                <h2 className="text-foreground text-xl font-semibold">Logotipo da Empresa</h2>
              </div>

              <div className="space-y-2">
                <div>
                  <Label htmlFor="logo" className="text-text">
                    Upload da Logo
                  </Label>
                  <FileInput
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(file);
                    }}
                    className="bg-muted hover:bg-muted-foreground/20"
                  />
                  <p className="text-text-muted mt-2 rounded-lg p-2 text-sm">
                    Formatos aceitos: PNG, JPG, JPEG (máximo 5MB)
                  </p>
                </div>

                {formData.logo && (
                  <div className="bg-muted flex items-center gap-2 rounded-lg p-3">
                    <FiUpload className="text-primary" />
                    <span className="text-foreground text-sm">Arquivo selecionado: {formData.logo.name}</span>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                color="gray"
                onClick={() => {
                  if (confirm('Tem certeza de que deseja cancelar? Todas as alterações serão perdidas.')) {
                    window.history.back();
                  }
                }}
                className="bg-muted hover:bg-muted-foreground/20"
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={isLoading} className="btn-primary">
                <FiSave className="mr-2 h-4 w-4" />
                {isLoading ? 'Atualizando...' : 'Atualizar Empresa'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
