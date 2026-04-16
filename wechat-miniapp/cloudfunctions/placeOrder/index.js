const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

exports.main = async function (event) {
  const items = event.items || [];
  if (!event.userId || !event.merchantId || !event.address || !items.length) {
    throw new Error('invalid payload');
  }
  const productsResult = await db.collection('products').where({
    _id: _.in(items.map(function (item) { return item.productId; }))
  }).get();
  const products = productsResult.data;
  let subtotal = 0;
  for (const item of items) {
    const product = products.find(function (entry) { return entry._id === item.productId; });
    if (!product || product.status !== 'on') {
      throw new Error('product unavailable');
    }
    if (Number(item.quantity) <= 0 || Number(item.quantity) > Number(product.stock)) {
      throw new Error('insufficient stock');
    }
    subtotal += Number(product.price) * Number(item.quantity);
  }
  const merchant = await db.collection('merchants').doc(event.merchantId).get();
  const totalAmount = Math.round((subtotal + Number(merchant.data.deliveryFee || 0)) * 100) / 100;
  const order = {
    userId: event.userId,
    merchantId: event.merchantId,
    items: items,
    addressSnapshot: event.address,
    subtotalAmount: subtotal,
    deliveryFee: merchant.data.deliveryFee || 0,
    totalAmount: totalAmount,
    remark: event.remark || '',
    status: 'pending_payment',
    paymentStatus: 'unpaid',
    refundStatus: 'none',
    createdAt: new Date()
  };
  const result = await db.collection('orders').add({ data: order });
  return { orderId: result._id, totalAmount: totalAmount };
};
