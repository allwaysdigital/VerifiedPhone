import { request } from './client';
import type { Brand } from '../types/domain';

export async function listBrands(): Promise<Brand[]> {
  return request<Brand[]>('/api/brands');
}

export async function createBrand(name: string): Promise<Brand> {
  return request<Brand>('/api/brands', { method: 'POST', body: { name } });
}
