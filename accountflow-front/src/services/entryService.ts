// src/services/entryService.ts
import api from '@/services/api';
import { EntryPayload, Entry } from '@/types/entry';
import { handleApiError } from '@/components/utils/HandlerError';

// Lista lançamentos por título (usa endpoint correto /titles/:id/entries/)
export async function getEntriesByTitle(titleId: string): Promise<Entry[]> {
  try {
    const res = await api.get<Entry[]>(`titles/${titleId}/entries/`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Erro ao buscar lançamentos do título.');
    return [];
  }
}

// Cria lançamento em um título
export async function createEntry(titleId: string, payload: EntryPayload): Promise<Entry> {
  try {
    const res = await api.post<Entry>(`titles/${titleId}/entries/`, payload);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Erro ao criar lançamento.');
    throw error;
  }
}

// Atualiza lançamento por UUID
export async function updateEntry(uuid: string, payload: EntryPayload): Promise<Entry> {
  try {
    const res = await api.put(`entries/${uuid}/`, payload);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Erro ao atualizar lançamento.');
    throw error;
  }
}

// Exclui lançamento por UUID
export async function deleteEntry(uuid: string): Promise<void> {
  try {
    await api.delete(`entries/${uuid}/`);
  } catch (error) {
    handleApiError(error, 'Erro ao excluir lançamento.');
    throw error;
  }
}

// Helper para salvar (criar/atualizar) recebível/pagamento
export async function saveEntry(titleId: string, payload: EntryPayload, uuid?: string): Promise<Entry> {
  try {
    return uuid ? await updateEntry(uuid, payload) : await createEntry(titleId, payload);
  } catch (error) {
    throw error;
  }
}
