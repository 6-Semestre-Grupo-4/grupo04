'use client';

import { useState, useEffect } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { FiRepeat, FiDollarSign, FiCalendar, FiType, FiAlertTriangle } from 'react-icons/fi';
import { Title } from '@/types/title';
import { Company } from '@/types/company';

interface TitleFormProps {
  show: boolean;
  onClose: () => void;
  onSave: (title: any, uuid?: string) => void;
  title?: Title | null;
  companies: Company[];
}

export default function TitleForm({ show, onClose, onSave, title, companies }: TitleFormProps) {
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
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

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
      });
    } else {
      setForm({
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
      });
    }
  }, [title]);

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
      installments: form.installments ? parseInt(form.installments) : null,
    };

    onSave(titleData, title?.uuid);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/20 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FiType className="text-blue-500" />
            <h3 className="text-lg font-semibold">{title ? 'Editar Título' : 'Novo Título'}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="type_of">Tipo *</Label>
                <div className="select-wrapper">
                  <select
                    id="type_of"
                    value={form.type_of}
                    onChange={(e) => setForm({ ...form, type_of: e.target.value })}
                    className="custom-select"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="company">Empresa *</Label>
                <div className="select-wrapper">
                  <select
                    id="company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className={`custom-select ${companies.length === 0 ? 'loading' : ''} ${!form.company && toast ? 'error' : ''}`}
                    data-placeholder={!form.company ? 'true' : 'false'}
                    required
                  >
                    <option value="">Selecione uma empresa...</option>
                    {companies.length > 0 ? (
                      companies.map((company) => (
                        <option key={company.uuid} value={company.uuid}>
                          {company.fantasy_name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        Carregando empresas...
                      </option>
                    )}
                  </select>
                </div>
                {!form.company && toast?.type === 'error' && (
                  <div className="select-error-message">
                    <FiAlertTriangle size={12} />
                    Campo obrigatório
                  </div>
                )}
              </div>

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
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Ativo</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.recorrence}
                  onChange={(e) => setForm({ ...form, recorrence: e.target.checked })}
                  className="custom-checkbox"
                />
                <span>Recorrente</span>
              </label>
            </div>

            {form.recorrence && (
              <div>
                <Label htmlFor="recorrence_period">Período de Recorrência</Label>
                <div className="select-wrapper">
                  <select
                    id="recorrence_period"
                    value={form.recorrence_period}
                    onChange={(e) => setForm({ ...form, recorrence_period: e.target.value })}
                    className="custom-select"
                    data-placeholder={!form.recorrence_period ? 'true' : 'false'}
                  >
                    <option value="">Selecione o período...</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-gray-200 dark:border-gray-700">
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
