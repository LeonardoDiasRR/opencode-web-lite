export function createSessionId(): string {
  return `ses_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}
