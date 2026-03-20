import { api } from './api';

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

/** Mirrors backend `UserResponse` (`GET /api/v1/auth/me`). */
export interface UserInfo {
  id: number;
  phone: string;
  nickname: string;
  avatar_url: string;
  role: string;
}

export async function login(phone: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>('/api/v1/auth/login', {
    phone,
    password,
  } satisfies LoginRequest);
  return data;
}

export async function getMe(): Promise<UserInfo> {
  const { data } = await api.get<UserInfo>('/api/v1/auth/me');
  return data;
}
