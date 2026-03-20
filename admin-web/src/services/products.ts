import { api } from './api';

/** Decimal fields are serialized as strings in JSON. */
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  images: string[];
  stock: number;
  is_on_shelf: boolean;
  created_at: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  price: string;
  images?: string[];
  stock?: number;
  is_on_shelf?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  price?: string;
  images?: string[];
  stock?: number;
  is_on_shelf?: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListProductsParams {
  page?: number;
  page_size?: number;
  /** Admin list: include off-shelf. Default `false` for this client. */
  on_shelf_only?: boolean;
  keyword?: string;
}

export interface UploadResponse {
  url: string;
  filename: string;
}

export async function listProducts(params: ListProductsParams = {}): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>('/api/v1/products', {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      on_shelf_only: params.on_shelf_only ?? false,
      keyword: params.keyword ?? '',
    },
  });
  return data;
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await api.get<Product>(`/api/v1/products/${id}`);
  return data;
}

export async function createProduct(body: ProductCreate): Promise<Product> {
  const { data } = await api.post<Product>('/api/v1/products', body);
  return data;
}

export async function updateProduct(id: number, body: ProductUpdate): Promise<Product> {
  const { data } = await api.put<Product>(`/api/v1/products/${id}`, body);
  return data;
}

export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/api/v1/products/${id}`);
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<UploadResponse>('/api/v1/upload', formData);
  return data;
}
