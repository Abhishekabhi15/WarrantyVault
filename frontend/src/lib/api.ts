export type ApiErrorDetail =
  | string
  | {
      loc?: Array<string | number>;
      msg?: string;
      type?: string;
    };

export class ApiError extends Error {
  status: number;
  details?: ApiErrorDetail[] | string;

  constructor(message: string, status: number, details?: ApiErrorDetail[] | string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export type User = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired';

export type Product = {
  id: number;
  user_id: number;
  name: string;
  brand: string | null;
  category: string | null;
  purchase_date: string;
  purchase_price: string | null;
  retailer: string | null;
  serial_number: string | null;
  warranty_duration_months: number;
  warranty_expiry_date: string;
  notes: string | null;
  warranty_status: WarrantyStatus;
  days_remaining: number;
  created_at: string;
  updated_at: string;
};

export type ProductInput = {
  name: string;
  brand?: string | null;
  category?: string | null;
  purchase_date: string;
  purchase_price?: string | null;
  retailer?: string | null;
  serial_number?: string | null;
  warranty_duration_months: number;
  notes?: string | null;
};

export type ProductUpdateInput = Partial<ProductInput>;

export type ProductListParams = {
  search?: string;
  category?: string;
  status?: WarrantyStatus;
  sort_by?: 'created_at' | 'purchase_date' | 'warranty_expiry_date' | 'name';
  sort_order?: 'asc' | 'desc';
  skip?: number;
  limit?: number;
};

export type Document = {
  id: number;
  user_id: number;
  product_id: number | null;
  original_filename: string;
  stored_filename: string;
  file_type: string;
  file_size: number;
  document_type: 'bill' | 'invoice' | 'receipt' | 'warranty';
  uploaded_at: string;
};

export type DashboardUpcomingExpiry = {
  id: number;
  name: string;
  brand: string | null;
  warranty_expiry_date: string;
  days_remaining: number;
  warranty_status: WarrantyStatus;
};

export type DashboardData = {
  total_products: number;
  active_warranties: number;
  expiring_soon: number;
  expired_warranties: number;
  total_documents: number;
  total_purchase_value: string;
  upcoming_expiries: DashboardUpcomingExpiry[];
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: BodyInit | null;
  headers?: HeadersInit;
  auth?: boolean;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api';
const TOKEN_KEY = 'warrantyvault_access_token';

let authToken: string | null =
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
let unauthorizedHandler: (() => void) | null = null;

function buildHeaders(body?: BodyInit | null, headers?: HeadersInit): Headers {
  const finalHeaders = new Headers(headers);
  if (body && !(body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  const token =
    authToken ?? (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);
  if (token) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }
  return finalHeaders;
}

async function parseError(response: Response): Promise<ApiError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'detail' in payload &&
    Array.isArray((payload as { detail?: unknown }).detail)
  ) {
    const details = (payload as { detail: ApiErrorDetail[] }).detail;
    return new ApiError(details.map(formatValidationDetail).join(' '), response.status, details);
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'detail' in payload &&
    typeof (payload as { detail?: unknown }).detail === 'string'
  ) {
    const detail = (payload as { detail: string }).detail;
    return new ApiError(detail, response.status, detail);
  }

  return new ApiError('Something went wrong. Please try again.', response.status);
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    body: options.body ?? null,
    headers: buildHeaders(options.body, options.headers),
  });

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function getFilenameFromDisposition(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const match = header.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? null;
}

function formatValidationDetail(detail: ApiErrorDetail): string {
  if (typeof detail === 'string') {
    return detail;
  }
  return detail.msg ?? 'Invalid request.';
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
}

export function configureApiClient(options: { token: string | null; onUnauthorized: () => void }): void {
  authToken = options.token;
  unauthorizedHandler = options.onUnauthorized;
}

export const api = {
  getAuthMe: () => request<User>('/auth/me'),
  register: (payload: { name: string; email: string; password: string }) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  login: (payload: { email: string; password: string }) =>
    request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDashboard: () => request<DashboardData>('/dashboard'),
  listProducts: (params: ProductListParams) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        searchParams.set(key, String(value));
      }
    }
    const query = searchParams.toString();
    return request<Product[]>(`/products${query ? `?${query}` : ''}`);
  },
  createProduct: (payload: ProductInput) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getProduct: (productId: number | string) => request<Product>(`/products/${productId}`),
  updateProduct: (productId: number | string, payload: ProductUpdateInput) =>
    request<Product>(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  deleteProduct: (productId: number | string) =>
    request<void>(`/products/${productId}`, {
      method: 'DELETE',
    }),
  uploadDocument: (payload: { file: File; documentType: string; productId?: number }) => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('document_type', payload.documentType);
    if (payload.productId !== undefined) {
      formData.append('product_id', String(payload.productId));
    }
    return request<Document>('/documents/upload', {
      method: 'POST',
      body: formData,
    });
  },
  listDocuments: (params?: { product_id?: number; document_type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.product_id !== undefined) {
      searchParams.set('product_id', String(params.product_id));
    }
    if (params?.document_type) {
      searchParams.set('document_type', params.document_type);
    }
    const query = searchParams.toString();
    return request<Document[]>(`/documents${query ? `?${query}` : ''}`);
  },
  getDocument: (documentId: number | string) =>
    request<Document>(`/documents/${documentId}`),
  deleteDocument: (documentId: number | string) =>
    request<void>(`/documents/${documentId}`, {
      method: 'DELETE',
    }),
  getExpiringWarranties: (days = 30) =>
    request<Product[]>(`/warranties/expiring?days=${days}`),
  async downloadDocument(
    documentId: number | string,
    fallbackFilename?: string,
  ): Promise<{ blob: Blob; filename: string }> {
    const response = await fetch(`${API_URL}/documents/${documentId}/download`, {
      headers: buildHeaders(null, undefined),
    });

    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    if (!response.ok) {
      throw await parseError(response);
    }

    const blob = await response.blob();
    const filename =
      getFilenameFromDisposition(response.headers.get('content-disposition')) ??
      fallbackFilename ??
      `document-${documentId}`;
    return { blob, filename };
  },
};

export function getApiUrl(): string {
  return API_URL;
}
