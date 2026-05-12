const secretPattern = /(api[_-]?key|token|secret|password)/i;

export function maskSecrets(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(maskSecrets);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, secretPattern.test(key) ? '***' : maskSecrets(entry)]));
}

export function preview(value: unknown): string {
  const text = typeof value === 'string' ? value : JSON.stringify(maskSecrets(value));
  return text.length > 1200 ? `${text.slice(0, 1200)}...` : text;
}
