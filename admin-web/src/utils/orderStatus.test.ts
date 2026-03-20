import { describe, expect, it } from 'vitest';
import { orderStatusTagColor } from './orderStatus';

describe('orderStatusTagColor', () => {
  it('maps known statuses to Ant Design tag colors', () => {
    expect(orderStatusTagColor('pending')).toBe('orange');
    expect(orderStatusTagColor('paid')).toBe('blue');
    expect(orderStatusTagColor('shipped')).toBe('cyan');
    expect(orderStatusTagColor('completed')).toBe('green');
    expect(orderStatusTagColor('cancelled')).toBe('red');
  });

  it('returns default for unknown status', () => {
    expect(orderStatusTagColor('unknown')).toBe('default');
  });
});
