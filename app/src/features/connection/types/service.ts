export interface ServiceConnection {
  baseUrl: string;
  token: string;
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface ServiceErrorResponse {
  error: string;
  code: string;
}
