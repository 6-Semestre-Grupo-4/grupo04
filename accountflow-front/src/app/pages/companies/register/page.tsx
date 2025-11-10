'use client';

import { useState } from 'react';
import { Card, Label, TextInput, Select, Button, FileInput } from 'flowbite-react';
import { FiSave, FiUpload } from 'react-icons/fi';
// TODO: Descomentar quando backend estiver pronto
// import companyService from '@/services/companyService';

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

  mobile_phone: string;
  state_registration: string;
  municipal_registration: string;
  tax_regime: string;

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
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CompanyPayload>({
    cnpj: '',
    fantasy_name: '',
    social_reason: '',
    opening_date: '',
    cnae: '',
    email: '',
    phone: '',
    mobile_phone: '',
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
      // TODO: Descomentar quando backend estiver pronto
      // const response = await companyService.create(formData);

      // Simulação com dados mockados
      console.log('Dados do formulário (MOCK):', formData);

      // Simula delay da API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert('Empresa cadastrada com sucesso! (MOCK)');
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      alert('Erro ao cadastrar empresa. Tente novamente.');
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cadastro de Empresa</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Preencha as informações abaixo para cadastrar uma nova empresa no sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações da Empresa</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <Label htmlFor="cnpj" className="text-gray-700 dark:text-gray-200">
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
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="social_reason" className="text-gray-700 dark:text-gray-200">
                    Razão Social *
                  </Label>
                  <TextInput
                    id="social_reason"
                    name="social_reason"
                    value={formData.social_reason}
                    onChange={(e) => handleInputChange('social_reason', e.target.value)}
                    placeholder="Informe a razão social da empresa"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="fantasy_name" className="text-gray-700 dark:text-gray-200">
                    Nome Fantasia *
                  </Label>
                  <TextInput
                    id="fantasy_name"
                    name="fantasy_name"
                    value={formData.fantasy_name}
                    onChange={(e) => handleInputChange('fantasy_name', e.target.value)}
                    placeholder="Informe o nome fantasia"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="opening_date" className="text-gray-700 dark:text-gray-200">
                    Data de Abertura *
                  </Label>
                  <TextInput
                    id="opening_date"
                    name="opening_date"
                    type="date"
                    value={formData.opening_date}
                    onChange={(e) => handleInputChange('opening_date', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="cnae" className="text-gray-700 dark:text-gray-200">
                    CNAE *
                  </Label>
                  <TextInput
                    id="cnae"
                    name="cnae"
                    value={formData.cnae}
                    onChange={(e) => handleInputChange('cnae', e.target.value)}
                    placeholder="0000-0/00"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="tax_regime" className="text-gray-700 dark:text-gray-200">
                    Regime Tributário *
                  </Label>
                  <Select
                    id="tax_regime"
                    name="tax_regime"
                    value={formData.tax_regime}
                    onChange={(e) => handleInputChange('tax_regime', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  >
                    {taxRegimeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações Tributárias</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state_registration" className="text-gray-700 dark:text-gray-200">
                    Inscrição Estadual (IE)
                  </Label>
                  <TextInput
                    id="state_registration"
                    name="state_registration"
                    value={formData.state_registration}
                    onChange={(e) => handleInputChange('state_registration', e.target.value)}
                    placeholder="Informe a inscrição estadual"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="municipal_registration" className="text-gray-700 dark:text-gray-200">
                    Inscrição Municipal (IM)
                  </Label>
                  <TextInput
                    id="municipal_registration"
                    name="municipal_registration"
                    value={formData.municipal_registration}
                    onChange={(e) => handleInputChange('municipal_registration', e.target.value)}
                    placeholder="Informe a inscrição municipal"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Endereço</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-1">
                  <Label htmlFor="cep" className="text-gray-700 dark:text-gray-200">
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
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <Label htmlFor="street" className="text-gray-700 dark:text-gray-200">
                    Logradouro *
                  </Label>
                  <TextInput
                    id="street"
                    name="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    placeholder="Informe o logradouro"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="state" className="text-gray-700 dark:text-gray-200">
                    Estado (UF) *
                  </Label>
                  <Select
                    id="state"
                    name="state"
                    value={formData.address.state}
                    onChange={(e) => handleInputChange('address.state', e.target.value)}
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
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
                  <Label htmlFor="number" className="text-gray-700 dark:text-gray-200">
                    Número *
                  </Label>
                  <TextInput
                    id="number"
                    name="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address.number', e.target.value)}
                    placeholder="123"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="complement" className="text-gray-700 dark:text-gray-200">
                    Complemento
                  </Label>
                  <TextInput
                    id="complement"
                    name="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address.complement', e.target.value)}
                    placeholder="Apto, sala, etc."
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="neighborhood" className="text-gray-700 dark:text-gray-200">
                    Bairro *
                  </Label>
                  <TextInput
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
                    placeholder="Informe o bairro"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="md:col-span-1">
                  <Label htmlFor="city" className="text-gray-700 dark:text-gray-200">
                    Cidade *
                  </Label>
                  <TextInput
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address.city', e.target.value)}
                    placeholder="Informe a cidade"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contato</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1">
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                    Email Principal *
                  </Label>
                  <TextInput
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="empresa@exemplo.com"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-200">
                    Telefone Fixo
                  </Label>
                  <TextInput
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const maskedValue = applyMask(e.target.value, '(99) 9999-9999');
                      handleInputChange('phone', maskedValue);
                    }}
                    placeholder="(11) 1234-5678"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>

                <div className="lg:col-span-1">
                  <Label htmlFor="mobile_phone" className="text-gray-700 dark:text-gray-200">
                    Celular
                  </Label>
                  <TextInput
                    id="mobile_phone"
                    name="mobile_phone"
                    value={formData.mobile_phone}
                    onChange={(e) => {
                      const maskedValue = applyMask(e.target.value, '(99) 99999-9999');
                      handleInputChange('mobile_phone', maskedValue);
                    }}
                    placeholder="(11) 99999-9999"
                    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Logotipo da Empresa</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo" className="text-gray-700 dark:text-gray-200">
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
                    className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Formatos aceitos: PNG, JPG, JPEG (máximo 5MB)
                  </p>
                </div>

                {formData.logo && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <FiUpload className="text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Arquivo selecionado: {formData.logo.name}
                    </span>
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
                className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                color="blue"
                disabled={isLoading}
                className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white"
              >
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
