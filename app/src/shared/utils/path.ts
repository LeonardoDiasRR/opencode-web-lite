export function joinWorkspacePath(basePath: string, ...segments: string[]): string {
  const separator = basePath.includes('\\') ? '\\' : '/';
  return [basePath.replace(/[\\/]$/, ''), ...segments].join(separator);
}
