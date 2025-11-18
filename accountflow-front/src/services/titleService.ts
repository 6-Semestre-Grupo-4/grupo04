import { Company } from '@/types/company';
import api from './api';
import { Title } from '@/types/title';

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function toArray<T>(data: T[] | Paginated<T> | any): T[] {
  return Array.isArray(data) ? data : (data?.results ?? []);
}

export const getTitles = async (): Promise<Title[]> => {
  const response = await api.get('/title/', { params: { page_size: 100 } });
  return toArray<Title>(response.data);
};

export const saveTitle = async (title: Title, uuid?: string): Promise<Title> => {
  if (uuid) {
    const response = await api.put(`/title/${uuid}/`, title);
    return response.data as Title;
  } else {
    const response = await api.post('/title/', title);
    return response.data as Title;
  }
};

export const getTitle = async (uuid: string): Promise<Title> => {
  const response = await api.get(`/title/${uuid}/`);
  return response.data as Title;
};

export const deleteTitle = async (uuid: string): Promise<void> => {
  await api.delete(`/title/${uuid}/`);
};

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/company/', { params: { page_size: 1000 } });
  return toArray<Company>(response.data);
};