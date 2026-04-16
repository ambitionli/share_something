function money(n) {
  const x = Number(n);
  if (Number.isNaN(x)) {
    return '0.00';
  }
  return x.toFixed(2);
}

function orderStatusText(s) {
  const map = {
    pending_pay: '待支付',
    pending_accept: '待接单',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消',
    refunding: '退款中',
    refunded: '已退款'
  };
  return map[s] || s;
}

module.exports = {
  money,
  orderStatusText
};
