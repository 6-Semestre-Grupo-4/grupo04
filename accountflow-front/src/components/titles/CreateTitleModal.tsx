import { useState } from 'react';
import { Modal, Label, TextInput, Select, Button } from 'flowbite-react';
import { HiPlus } from 'react-icons/hi';

interface Title {
  uuid?: string;
  description: string;
  amount: number;
  expiration_date: string;
  active: boolean;
  recorrente: boolean;
  recurrence_period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  installments?: number;
  payable_billing_account?: string;
  receivable_billing_account?: string;
}

interface CreateTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: Title) => void;
  billingAccounts: Array<{ uuid: string; name: string }>;
}

export function CreateTitleModal({ isOpen, onClose, onSave, billingAccounts }: CreateTitleModalProps) {
  const [formData, setFormData] = useState<Title>({
    description: '',
    amount: 0,
    expiration_date: '',
    active: true,
    recorrente: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      description: '',
      amount: 0,
      expiration_date: '',
      active: true,
      recorrente: false,
    });
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Novo Título</h3>

          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="description">Descrição</Label>
              </div>
              <TextInput
                id="description"
                name="description"
                type="text"
                required
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="amount">Valor</Label>
              </div>
              <TextInput
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="expiration_date">Data de Vencimento</Label>
              </div>
              <TextInput
                id="expiration_date"
                name="expiration_date"
                type="date"
                required
                value={formData.expiration_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="active"
                name="active"
                type="checkbox"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="active">Ativo</Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="recorrente"
                name="recorrente"
                type="checkbox"
                checked={formData.recorrente}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="recorrente">Recorrente</Label>
            </div>

            {formData.recorrente && (
              <>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="recurrence_period">Período de Recorrência</Label>
                  </div>
                  <Select
                    id="recurrence_period"
                    name="recurrence_period"
                    value={formData.recurrence_period || ''}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione</option>
                    <option value="daily">Diário</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                  </Select>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="installments">Parcelas</Label>
                  </div>
                  <TextInput
                    id="installments"
                    name="installments"
                    type="number"
                    min="1"
                    value={formData.installments || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="payable_billing_account">Conta de Cobrança (A Pagar)</Label>
              </div>
              <Select
                id="payable_billing_account"
                name="payable_billing_account"
                value={formData.payable_billing_account || ''}
                onChange={handleInputChange}
              >
                <option value="">Selecione uma conta</option>
                {billingAccounts.map((account) => (
                  <option key={account.uuid} value={account.uuid}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="receivable_billing_account">Conta de Cobrança (A Receber)</Label>
              </div>
              <Select
                id="receivable_billing_account"
                name="receivable_billing_account"
                value={formData.receivable_billing_account || ''}
                onChange={handleInputChange}
              >
                <option value="">Selecione uma conta</option>
                {billingAccounts.map((account) => (
                  <option key={account.uuid} value={account.uuid}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="blue">
            <HiPlus className="mr-2 h-5 w-5" />
            Criar Título
          </Button>
        </div>
      </form>
    </Modal>
  );
}
