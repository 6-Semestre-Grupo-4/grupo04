import { useState } from 'react';
import { Modal, Label, TextInput, Select, Button } from 'flowbite-react';
import { HiPlus } from 'react-icons/hi';

interface Entry {
  uuid?: string;
  title: string;
  description: string;
  type_of: 'Income' | 'Expense';
  amount: number;
  date: string;
}

interface CreateEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Entry) => void;
  titles: Array<{ uuid: string; description: string }>;
}

export function CreateEntryModal({ isOpen, onClose, onSave, titles }: CreateEntryModalProps) {
  const [formData, setFormData] = useState<Entry>({
    title: '',
    description: '',
    type_of: 'Income',
    amount: 0,
    date: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    setFormData({
      title: '',
      description: '',
      type_of: 'Income',
      amount: 0,
      date: '',
    });
  };

  return (
    <Modal show={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-4">Novo Lançamento</h3>

          <div className="space-y-6">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="title">Título</Label>
              </div>
              <Select id="title" name="title" required value={formData.title} onChange={handleInputChange}>
                <option value="">Selecione um título</option>
                {titles.map((title) => (
                  <option key={title.uuid} value={title.uuid}>
                    {title.description}
                  </option>
                ))}
              </Select>
            </div>

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
                <Label htmlFor="type_of">Tipo</Label>
              </div>
              <Select id="type_of" name="type_of" required value={formData.type_of} onChange={handleInputChange}>
                <option value="Income">Receita</option>
                <option value="Expense">Despesa</option>
              </Select>
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
                <Label htmlFor="date">Data</Label>
              </div>
              <TextInput
                id="date"
                name="date"
                type="date"
                required
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" color="blue">
            <HiPlus className="mr-2 h-5 w-5" />
            Criar Lançamento
          </Button>
        </div>
      </form>
    </Modal>
  );
}
