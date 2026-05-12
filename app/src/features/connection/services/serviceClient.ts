import type { HealthResponse, ServiceConnection, ServiceErrorResponse } from '../types/service.js';

export class ServiceClientError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  const body = (await response.json().catch(() => null)) as ServiceErrorResponse | null;
  throw new ServiceClientError(body?.error ?? 'Service request failed', body?.code ?? 'REQUEST_FAILED');
}

export function createServiceClient(connection: ServiceConnection) {
  const baseUrl = connection.baseUrl.replace(/\/$/, '');

  return {
    async health(): Promise<HealthResponse> {
      const response = await fetch(`${baseUrl}/health`);
      return parseResponse<HealthResponse>(response);
    },

    async get<T>(path: string): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${connection.token}` },
      });
      return parseResponse<T>(response);
    },

    async post<T>(path: string, body: unknown): Promise<T> {
      const response = await fetch(`${baseUrl}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${connection.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      return parseResponse<T>(response);
    },
  };
}
