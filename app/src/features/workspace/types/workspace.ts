export interface WorkspaceConfig {
  version?: string;
  provider?: unknown;
  agents?: unknown;
  skills?: unknown;
  plugins?: unknown;
  mcps?: unknown;
  [key: string]: unknown;
}

export interface WorkspaceStatusResponse {
  initialized: boolean;
  config: WorkspaceConfig | null;
}

export interface WorkspaceInitResponse {
  initialized: boolean;
  path: string;
  config: WorkspaceConfig;
}
