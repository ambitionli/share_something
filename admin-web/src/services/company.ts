import { api } from './api';

export interface CompanyInfo {
  id: number;
  title: string;
  description: string;
  photos: string[];
  updated_at: string;
}

export interface CompanyInfoUpdate {
  title: string;
  description?: string;
  photos?: string[];
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  cover_image: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

export interface NewsCreate {
  title: string;
  content?: string;
  cover_image?: string;
  is_published?: boolean;
}

export interface NewsUpdate {
  title?: string;
  content?: string;
  cover_image?: string;
  is_published?: boolean;
}

export interface PaginatedNews {
  items: NewsItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListNewsParams {
  page?: number;
  page_size?: number;
  /** Admin list: include drafts. Default `false` for this client. */
  published_only?: boolean;
}

export async function getCompanyInfo(): Promise<CompanyInfo | null> {
  const { data } = await api.get<CompanyInfo | null>('/api/v1/company/info');
  return data;
}

export async function updateCompanyInfo(body: CompanyInfoUpdate): Promise<CompanyInfo> {
  const { data } = await api.put<CompanyInfo>('/api/v1/company/info', body);
  return data;
}

export async function listNews(params: ListNewsParams = {}): Promise<PaginatedNews> {
  const { data } = await api.get<PaginatedNews>('/api/v1/company/news', {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 10,
      published_only: params.published_only ?? false,
    },
  });
  return data;
}

export async function createNews(body: NewsCreate): Promise<NewsItem> {
  const { data } = await api.post<NewsItem>('/api/v1/company/news', body);
  return data;
}

export async function updateNews(id: number, body: NewsUpdate): Promise<NewsItem> {
  const { data } = await api.put<NewsItem>(`/api/v1/company/news/${id}`, body);
  return data;
}

export async function deleteNews(id: number): Promise<void> {
  await api.delete(`/api/v1/company/news/${id}`);
}
