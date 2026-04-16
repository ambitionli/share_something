const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async function (event) {
  if (!event.orderId || !event.paymentId) {
    throw new Error('missing order info');
  }
  const order = await db.collection('orders').doc(event.orderId).get();
  if (!order.data) {
    throw new Error('order not found');
  }
  if (order.data.status !== 'pending_payment') {
    return { skipped: true, reason: 'status not pending_payment' };
  }
  await db.collection('orders').doc(event.orderId).update({
    data: {
      status: 'pending_accept',
      paymentStatus: 'paid',
      paymentId: event.paymentId,
      paidAt: new Date()
    }
  });
  return { success: true };
};
