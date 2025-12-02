'use client';

import { useEffect, useState } from 'react';
import { Card, Label, TextInput, Select, Button, FileInput } from 'flowbite-react';
import { FiSave, FiUpload } from 'react-icons/fi';
import ToastNotification from '@/components/utils/toastNotification';
import { useRouter } from 'next/navigation';
import companyService from '@/services/companyService';

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

export default function CompanyRegister() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
      // Chama o backend para criar a empresa
      await companyService.create(formData as any);

      setToast({ message: 'Empresa cadastrada com sucesso!', type: 'success' });
      // Navega após breve delay para permitir ver o toast
      setTimeout(() => router.push('/pages/company'), 800);
    } catch (error) {
      // Tenta extrair erros do backend (DRF) — pode ser objeto de campos ou mensagem
      const respData = (error as any)?.response?.data;
      let message = 'Erro ao cadastrar empresa. Tente novamente.';
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

  async function fetchCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');

    if (cleanCep.length !== 8) return null;

    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`);
      if (!res.ok) throw new Error('CEP não encontrado');
      return await res.json();
    } catch (err) {
      return null;
    }
  }

  const [loadingCep, setLoadingCep] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    const cleanCep = formData.address.cep.replace(/\D/g, '');

    if (cleanCep.length === 8) {
      setLoadingCep(true);

      fetch(`https://brasilapi.com.br/api/cep/v1/${cleanCep}`)
        .then(async (res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          handleInputChange('address.street', data.street || '');
          handleInputChange('address.neighborhood', data.neighborhood || '');
          handleInputChange('address.city', data.city || '');
          handleInputChange('address.state', data.state || '');
        })
        .catch(() => {
          setToast({
            message: 'CEP inválido ou não encontrado.',
            type: 'error',
          });
        })
        .finally(() => {
          setLoadingCep(false);
        });
    }
  }, [formData.address.cep]);

  const [loadingCnpj, setLoadingCnpj] = useState(false);
  useEffect(() => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');

    if (cleanCnpj.length === 14) {
      setLoadingCnpj(true);

      fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)
        .then(async (res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          // Preenche dados principais
          handleInputChange('social_reason', data.razao_social || '');
          handleInputChange('fantasy_name', data.nome_fantasia || '');
          handleInputChange('opening_date', data.data_inicio_atividade || '');
          handleInputChange('cnae', data.cnae_fiscal || '');

          // Preenche endereço (quando existir)
          if (data.estabelecimento) {
            const est = data.estabelecimento;

            handleInputChange('address.cep', est.cep || '');
            handleInputChange('address.street', est.logradouro || '');
            handleInputChange('address.number', est.numero || '');
            handleInputChange('address.complement', est.complemento || '');
            handleInputChange('address.neighborhood', est.bairro || '');
            handleInputChange('address.city', est.cidade?.nome || '');
            handleInputChange('address.state', est.estado?.sigla || '');
          }
        })
        .catch(() => {
          setToast({
            message: 'CNPJ inválido ou não encontrado.',
            type: 'error',
          });
        })
        .finally(() => {
          setLoadingCnpj(false);
        });
    }
  }, [formData.cnpj]);

  return (
    <div className="bg-background min-h-screen transition-colors duration-200">
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="container mx-auto px-4 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-2">
            <h1 className="text-foreground mb-2 text-3xl font-bold">Cadastro de Empresa</h1>
            <p className="text-text-muted">
              Preencha as informações abaixo para cadastrar uma nova empresa no sistema.
            </p>
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
                  {loadingCnpj && <p className="text-text-muted mt-1 text-sm">Buscando dados do CNPJ…</p>}
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

                  {loadingCep && <p className="text-text-muted mt-1 text-sm">Buscando endereço…</p>}
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
                    Celular
                  </Label>
                  <TextInput
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const maskedValue = applyMask(e.target.value, '(99) 99999-9999');
                      handleInputChange('phone', maskedValue);
                    }}
                    placeholder="(11) 99999-9999"
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
                  if (confirm('Tem certeza de que deseja cancelar? Todos os dados serão perdidos.')) {
                    window.history.back();
                  }
                }}
                className="bg-muted hover:bg-muted-foreground/20"
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={isLoading} className="btn-primary">
                <FiSave className="mr-2 h-4 w-4" />
                {isLoading ? 'Salvando...' : 'Salvar Cadastro'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
