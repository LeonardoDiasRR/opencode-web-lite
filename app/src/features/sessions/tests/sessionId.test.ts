import { describe, expect, it } from 'vitest';
import { createSessionId } from '../services/sessionId.js';

describe('createSessionId', () => {
  it('generates safe session ids', () => {
    const first = createSessionId();
    const second = createSessionId();

    expect(first).toMatch(/^ses_[a-f0-9]{16}$/);
    expect(first).not.toBe(second);
  });
});
