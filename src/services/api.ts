// Base API configuration
const DEFAULT_API_URL = 'http://localhost:8000';
const API_ENDPOINT_KEY = 'api_endpoint';

function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(API_ENDPOINT_KEY) || DEFAULT_API_URL;
  }
  return DEFAULT_API_URL;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API request failed: ${response.statusText}`);
  }

  return response.json();
}