const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async function (event) {
  if (!event.orderId || !event.userId || !event.merchantId) {
    throw new Error('missing review payload');
  }
  if (Number(event.rating) < 1 || Number(event.rating) > 5) {
    throw new Error('invalid rating');
  }
  const review = {
    orderId: event.orderId,
    userId: event.userId,
    merchantId: event.merchantId,
    rating: Number(event.rating),
    content: event.content || '',
    images: event.images || [],
    createdAt: new Date()
  };
  const result = await db.collection('reviews').add({ data: review });
  await db.collection('orders').doc(event.orderId).update({ data: { reviewId: result._id } });
  return { reviewId: result._id };
};
