/** API origin for axios and absolute upload URLs. Empty = same origin (behind reverse proxy). */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
