const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async function (event) {
  if (!event.orderId) {
    throw new Error('missing order id');
  }
  const approve = !!event.approve;
  const order = await db.collection('orders').doc(event.orderId).get();
  if (!order.data) {
    throw new Error('order not found');
  }
  if (event.mode === 'request') {
    if (!['pending_accept', 'delivering'].includes(order.data.status)) {
      throw new Error('refund unavailable');
    }
    await db.collection('orders').doc(event.orderId).update({
      data: {
        refundStatus: 'requested',
        refundReason: event.reason || '用户申请退款'
      }
    });
    return { success: true, status: 'requested' };
  }
  await db.collection('orders').doc(event.orderId).update({
    data: approve ? {
      status: 'refunded',
      paymentStatus: 'refunded',
      refundStatus: 'approved',
      merchantReply: event.note || '商家已同意退款'
    } : {
      refundStatus: 'rejected',
      merchantReply: event.note || '商家驳回退款申请'
    }
  });
  return { success: true, status: approve ? 'approved' : 'rejected' };
};
