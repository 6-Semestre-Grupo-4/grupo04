import { Company } from '@/types/company';
import api from './api';
import { Title } from '@/types/title';

export const getTitles = async (): Promise<Title[]> => {
  const response = await api.get('/title/');
  return response.data;
};

export const saveTitle = async (title: Title, uuid?: string): Promise<Title> => {
  if (uuid) {
    const response = await api.put(`/title/${uuid}/`, title);
    return response.data;
  } else {
    const response = await api.post('/title/', title);
    return response.data;
  }
};

export const getTitle = async (uuid: string): Promise<Title> => {
  const response = await api.get(`/title/${uuid}/`);
  return response.data;
};

export const deleteTitle = async (uuid: string): Promise<void> => {
  await api.delete(`/title/${uuid}/`);
};

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/company/');
  return response.data;
};
