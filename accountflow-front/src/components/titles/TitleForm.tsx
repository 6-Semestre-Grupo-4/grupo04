'use client';

import { useState, useEffect } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { Type, AlertTriangle, X } from 'lucide-react';

import { Title } from '@/types/title';
import { Company } from '@/types/company';
import { Preset } from '@/types/preset';
import { getPresets } from '@/services/presetService';
import { replacePresetVariables } from '@/components/utils/presetTemplate';
// import { getCompanies } from '@/services/companyService'; Quando implementar empresas

interface TitleFormProps {
  show: boolean;
  onClose: () => void;
  onSave: (title: Title, uuid?: string) => void;
  title?: Title | null;
  companies: Company[];
  typeLocked?: boolean;
}

export default function TitleForm({ show, onClose, onSave, title, companies, typeLocked = false }: TitleFormProps) {
  const [presets, setPresets] = useState<Preset[]>([]);

  const [form, setForm] = useState({
    description: '',
    type_of: 'income',
    amount: '',
    expiration_date: '',
    fees_percentage_monthly: '',
    installments: '',
    active: true,
    recorrence: false,
    recorrence_period: '',
    company: '',
    preset: '',
  });

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const data = await getPresets();
        setPresets(data);
      } catch (error) {
        console.error('Erro ao buscar presets:', error);
      }
    };
    fetchPresets();
  }, []);

  useEffect(() => {
    if (title) {
      setForm({
        description: title.description || '',
        type_of: title.type_of || 'income',
        amount: title.amount?.toString() || '',
        expiration_date: title.expiration_date ? new Date(title.expiration_date).toISOString().split('T')[0] : '',
        fees_percentage_monthly: title.fees_percentage_monthly?.toString() || '',
        installments: title.installments?.toString() || '',
        active: title.active ?? true,
        recorrence: title.recorrence || false,
        recorrence_period: title.recorrence_period || '',
        company: typeof title.company === 'string' ? title.company : '',
        preset: title.preset || '',
      });
    } else {
      setForm({
        description: '',
        type_of: typeLocked ? 'expense' : 'income',
        amount: '',
        expiration_date: '',
        fees_percentage_monthly: '',
        installments: '',
        active: true,
        recorrence: false,
        recorrence_period: '',
        company: '',
        preset: '',
      });
    }
  }, [title, typeLocked]);

  useEffect(() => {
    if (!form.preset) return;
    const preset = presets.find((p) => p.uuid === form.preset);
    if (!preset) return;

    const company = companies.find((c) => c.uuid === form.company);
    if (!company) return;

    const finalDescription = replacePresetVariables(preset.description, company);
    setForm((prev) => ({ ...prev, description: finalDescription }));
  }, [form.preset, form.company, companies, presets]);

  useEffect(() => {
    if (!form.recorrence) {
      setForm((prev) => ({ ...prev, installments: '1' }));
    }
  }, [form.recorrence]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.company) {
      setToast({ message: 'Empresa é obrigatória', type: 'error' });
      return;
    }

    const titleData = {
      ...form,
      amount: parseFloat(form.amount),
      fees_percentage_monthly: form.fees_percentage_monthly
        ? parseFloat((parseFloat(form.fees_percentage_monthly) / 100).toFixed(2))
        : 0,
      installments: form.installments ? parseInt(form.installments) : 1,
    };

    onSave(titleData, title?.uuid);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
      <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Type className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold">{title ? 'Editar Título' : 'Novo Título'}</h3>
          </div>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* DESCRIÇÃO */}
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <TextInput
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Digite a descrição"
                  required
                />
              </div>

              {/* TIPO */}
              <div>
                <Label htmlFor="type_of">Tipo *</Label>
                <select
                  id="type_of"
                  value={form.type_of}
                  onChange={(e) => !typeLocked && setForm({ ...form, type_of: e.target.value })}
                  disabled={typeLocked}
                  className={`custom-select appearance-none ${typeLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>

              {/* EMPRESA */}
              <div>
                <Label htmlFor="company">Empresa *</Label>
                <select
                  id="company"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className={`custom-select ${
                    companies.length === 0 ? 'loading' : ''
                  } ${!form.company && toast ? 'error' : ''}`}
                  required
                >
                  <option value="">Selecione uma empresa...</option>
                  {companies.map((company) => (
                    <option key={company.uuid} value={company.uuid}>
                      {company.fantasy_name}
                    </option>
                  ))}
                </select>

                {!form.company && toast?.type === 'error' && (
                  <div className="select-error-message">
                    <AlertTriangle size={12} />
                    Campo obrigatório
                  </div>
                )}
              </div>

              {/* VALOR */}
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <TextInput
                  id="amount"
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              {/* DATA */}
              <div>
                <Label htmlFor="expiration_date">Data de Vencimento *</Label>
                <TextInput
                  id="expiration_date"
                  type="date"
                  value={form.expiration_date}
                  onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
                  required
                />
              </div>

              {/* JUROS */}
              <div>
                <Label htmlFor="fees_percentage_monthly">Taxa de Juros Mensal (%)</Label>
                <TextInput
                  id="fees_percentage_monthly"
                  type="number"
                  step="0.01"
                  value={form.fees_percentage_monthly}
                  onChange={(e) => setForm({ ...form, fees_percentage_monthly: e.target.value })}
                  placeholder="0,00"
                />
              </div>

              {/* PRESET */}
              <div>
                <Label htmlFor="preset">Preset</Label>
                <select
                  id="preset"
                  value={form.preset}
                  onChange={(e) => setForm({ ...form, preset: e.target.value })}
                  className="custom-select"
                >
                  <option value="">Nenhum preset</option>
                  {presets
                    .filter((p) => p.active)
                    .map((preset) => (
                      <option key={preset.uuid} value={preset.uuid}>
                        {preset.name} - {preset.description}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* CHECKBOXES */}
            <div className="flex items-center gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Ativo</span>
              </label>

              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.recorrence}
                  onChange={(e) => setForm({ ...form, recorrence: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Recorrente</span>
              </label>
            </div>

            {/* RECORRÊNCIA */}
            {form.recorrence && (
              <>
                <div>
                  <Label htmlFor="recorrence_period">Período de Recorrência</Label>
                  <select
                    id="recorrence_period"
                    value={form.recorrence_period}
                    onChange={(e) => setForm({ ...form, recorrence_period: e.target.value })}
                    className="custom-select"
                  >
                    <option value="">Selecione o período...</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="installments">Parcelas</Label>
                  <TextInput
                    id="installments"
                    type="number"
                    value={form.installments}
                    onChange={(e) => setForm({ ...form, installments: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </>
            )}
          </form>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-2 border-t border-gray-200 p-6 dark:border-gray-700">
          <Button color="gray" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="btn-primary">
            {title ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
