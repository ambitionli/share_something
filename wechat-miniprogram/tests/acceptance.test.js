const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../shared/engine');
const { createSeedState } = require('../shared/seed');

test('acceptance loop covers ordering, delivery, completion, review, refund, and stats', () => {
  const state = createSeedState();
  state.users.push({
    id: 'user_market_admin',
    phone: '17700004444',
    nickname: '超市掌柜',
    role: 'merchant',
    avatarUrl: '',
    balance: 50,
    merchantId: 'merchant_night_market',
  });

  const home = engine.listHomeMerchants(state, { keyword: '', category: 'all' });
  assert.equal(home.merchants.length >= 4, true);

  engine.updateCartItem(state, { merchantId: 'merchant_noodle_house', productId: 'product_beef_noodle', delta: 1 });
  engine.updateCartItem(state, { merchantId: 'merchant_noodle_house', productId: 'product_fried_rice', delta: 1 });
  const created = engine.createOrder(state, { addressId: 'address_home', couponId: 'coupon_new_user', remark: '少辣' });
  engine.payOrder(state, { orderId: created.order.id, paymentMethod: 'wechat' });

  state.session.currentUserId = 'user_merchant_demo';
  engine.merchantHandleOrder(state, { orderId: created.order.id, action: 'accept' });
  engine.merchantHandleOrder(state, { orderId: created.order.id, action: 'deliver', courierName: '骑手老王' });

  state.session.currentUserId = 'user_buyer_demo';
  engine.completeOrder(state, { orderId: created.order.id });
  const review = engine.submitReview(state, {
    orderId: created.order.id,
    rating: 5,
    content: '流程完整，配送准时',
    images: ['tmp://review.png'],
  });
  assert.equal(review.orderId, created.order.id);

  engine.updateCartItem(state, { merchantId: 'merchant_night_market', productId: 'product_cola_pack', delta: 2 });
  const refundOrder = engine.createOrder(state, { addressId: 'address_home' });
  engine.payOrder(state, { orderId: refundOrder.order.id, paymentMethod: 'balance' });
  engine.requestRefund(state, { orderId: refundOrder.order.id, reason: '改了需求' });

  state.session.currentUserId = 'user_market_admin';
  engine.merchantHandleOrder(state, { orderId: refundOrder.order.id, action: 'process_refund', note: '库存回补完成' });

  const dashboard = engine.getMerchantDashboard(state, {});
  assert.equal(dashboard.stats.productCount >= 2, true);

  state.session.currentUserId = 'user_buyer_demo';
  const completedOrders = engine.listOrdersByUser(state, { tab: engine.ORDER_STATUS.COMPLETED });
  const refundOrders = engine.listOrdersByUser(state, { tab: 'refund' });
  assert.equal(completedOrders.length, 1);
  assert.equal(refundOrders.length, 1);
});
