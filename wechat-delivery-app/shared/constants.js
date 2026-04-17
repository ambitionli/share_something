const CATEGORY_OPTIONS = [
  { id: "all", name: "全部" },
  { id: "food", name: "餐饮" },
  { id: "market", name: "超市" },
  { id: "medicine", name: "药品" },
  { id: "fresh", name: "生鲜" }
];

const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PENDING_ACCEPTANCE: "pending_acceptance",
  ACCEPTED: "accepted",
  DELIVERING: "delivering",
  COMPLETED: "completed",
  REFUND_REQUESTED: "refund_requested",
  REFUNDED: "refunded",
  REJECTED: "rejected"
};

const STATUS_META = {
  [ORDER_STATUS.PENDING_PAYMENT]: { label: "待支付", group: "待支付" },
  [ORDER_STATUS.PENDING_ACCEPTANCE]: { label: "待接单", group: "待接单" },
  [ORDER_STATUS.ACCEPTED]: { label: "备餐中", group: "配送中" },
  [ORDER_STATUS.DELIVERING]: { label: "配送中", group: "配送中" },
  [ORDER_STATUS.COMPLETED]: { label: "已完成", group: "已完成" },
  [ORDER_STATUS.REFUND_REQUESTED]: { label: "退款处理中", group: "退款" },
  [ORDER_STATUS.REFUNDED]: { label: "已退款", group: "退款" },
  [ORDER_STATUS.REJECTED]: { label: "已拒单", group: "退款" }
};

const MERCHANT_TABS = [
  { id: "join", name: "入驻" },
  { id: "products", name: "商品" },
  { id: "orders", name: "订单" },
  { id: "stats", name: "概览" }
];

module.exports = {
  CATEGORY_OPTIONS,
  ORDER_STATUS,
  STATUS_META,
  MERCHANT_TABS
};
