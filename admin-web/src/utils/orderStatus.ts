/** Ant Design Tag `color` for order workflow states. */
export function orderStatusTagColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'orange';
    case 'paid':
      return 'blue';
    case 'shipped':
      return 'cyan';
    case 'completed':
      return 'green';
    case 'cancelled':
      return 'red';
    default:
      return 'default';
  }
}
