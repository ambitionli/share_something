const CATEGORY_OPTIONS = [
  { id: 'all', name: '全部' },
  { id: 'restaurant', name: '餐饮' },
  { id: 'market', name: '超市' },
  { id: 'medicine', name: '药品' },
  { id: 'fresh', name: '生鲜' },
];

const ORDER_STATUS = {
  PENDING_PAY: 'pending_pay',
  PENDING_ACCEPT: 'pending_accept',
  ACCEPTED: 'accepted',
  DELIVERING: 'delivering',
  COMPLETED: 'completed',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
  REJECTED: 'rejected',
};

const ORDER_TAB_DEFS = [
  { id: 'all', name: '全部' },
  { id: ORDER_STATUS.PENDING_PAY, name: '待支付' },
  { id: ORDER_STATUS.PENDING_ACCEPT, name: '待接单' },
  { id: ORDER_STATUS.DELIVERING, name: '配送中' },
  { id: ORDER_STATUS.COMPLETED, name: '已完成' },
  { id: 'refund', name: '退款' },
];

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING_PAY]: '待支付',
  [ORDER_STATUS.PENDING_ACCEPT]: '待接单',
  [ORDER_STATUS.ACCEPTED]: '已接单',
  [ORDER_STATUS.DELIVERING]: '配送中',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.REFUNDING]: '退款中',
  [ORDER_STATUS.REFUNDED]: '已退款',
  [ORDER_STATUS.REJECTED]: '已拒单',
  approved: '已通过',
  pending: '待审核',
  on_sale: '已上架',
  off_sale: '已下架',
  used: '已使用',
  unused: '可使用',
  expired: '已过期',
};

const PAYMENT_METHODS = [
  { id: 'wechat', name: '模拟微信支付' },
  { id: 'balance', name: '余额支付' },
];

const PRODUCT_STATUS = {
  ON_SALE: 'on_sale',
  OFF_SALE: 'off_sale',
};

const MERCHANT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
};

const STORAGE_KEYS = {
  state: 'linli-jida-demo-state',
  settings: 'linli-jida-settings',
};

module.exports = {
  CATEGORY_OPTIONS,
  ORDER_STATUS,
  ORDER_TAB_DEFS,
  STATUS_LABELS,
  PAYMENT_METHODS,
  PRODUCT_STATUS,
  MERCHANT_STATUS,
  STORAGE_KEYS,
};
