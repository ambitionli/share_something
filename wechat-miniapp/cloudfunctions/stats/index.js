const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async function (event) {
  if (!event.merchantId) {
    throw new Error('missing merchant id');
  }
  const orders = await db.collection('orders').where({ merchantId: event.merchantId }).get();
  const list = orders.data || [];
  return {
    totalOrders: list.length,
    waitingOrders: list.filter(function (item) { return item.status === 'pending_accept'; }).length,
    deliveringOrders: list.filter(function (item) { return item.status === 'delivering'; }).length,
    refundOrders: list.filter(function (item) { return item.status === 'refunded' || item.refundStatus === 'requested'; }).length,
    revenue: list.filter(function (item) { return item.status === 'completed'; }).reduce(function (total, item) {
      return total + Number(item.totalAmount || 0);
    }, 0)
  };
};
