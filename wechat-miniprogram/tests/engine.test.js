const test = require('node:test');
const assert = require('node:assert/strict');
const engine = require('../shared/engine');
const { createSeedState } = require('../shared/seed');

function createState() {
  return createSeedState();
}

test('complete happy path from cart to review', () => {
  const state = createState();
  engine.updateCartItem(state, { merchantId: 'merchant_noodle_house', productId: 'product_beef_noodle', delta: 2 });
  const preview = engine.quoteCheckout(state, { addressId: 'address_home', couponId: 'coupon_new_user' });
  assert.equal(preview.total, 50);

  const created = engine.createOrder(state, { addressId: 'address_home', couponId: 'coupon_new_user' });
  assert.equal(created.order.status, engine.ORDER_STATUS.PENDING_PAY);
  assert.equal(state.cart.items.length, 0);

  const paid = engine.payOrder(state, { orderId: created.order.id, paymentMethod: 'wechat' });
  assert.equal(paid.status, engine.ORDER_STATUS.PENDING_ACCEPT);

  state.session.currentUserId = 'user_merchant_demo';
  const accepted = engine.merchantHandleOrder(state, { orderId: created.order.id, action: 'accept' });
  assert.equal(accepted.status, engine.ORDER_STATUS.ACCEPTED);
  const delivering = engine.merchantHandleOrder(state, { orderId: created.order.id, action: 'deliver', courierName: '小李' });
  assert.equal(delivering.status, engine.ORDER_STATUS.DELIVERING);

  state.session.currentUserId = 'user_buyer_demo';
  const completed = engine.completeOrder(state, { orderId: created.order.id });
  assert.equal(completed.status, engine.ORDER_STATUS.COMPLETED);

  const review = engine.submitReview(state, {
    orderId: created.order.id,
    rating: 5,
    content: '面很筋道，配送也快',
    images: ['tmp://a.png'],
  });
  assert.equal(review.rating, 5);
  assert.equal(state.reviews.length, 1);
});

test('payment is idempotent and never creates negative stock', () => {
  const state = createState();
  engine.updateCartItem(state, { merchantId: 'merchant_safe_medicine', productId: 'product_cold_medicine', delta: 1 });
  const created = engine.createOrder(state, { addressId: 'address_home' });
  const firstPay = engine.payOrder(state, { orderId: created.order.id, paymentMethod: 'balance' });
  const secondPay = engine.payOrder(state, { orderId: created.order.id, paymentMethod: 'balance' });

  assert.equal(firstPay.paymentMethod, 'balance');
  assert.equal(secondPay.status, engine.ORDER_STATUS.PENDING_ACCEPT);
  assert.equal(state.products.find((item) => item.id === 'product_cold_medicine').stock, 49);
});

test('refund flow restores stock and balance when processed', () => {
  const state = createState();
  engine.updateCartItem(state, { merchantId: 'merchant_night_market', productId: 'product_cola_pack', delta: 2 });
  const created = engine.createOrder(state, { addressId: 'address_home' });
  engine.payOrder(state, { orderId: created.order.id, paymentMethod: 'balance' });

  const balanceAfterPay = state.users.find((item) => item.id === 'user_buyer_demo').balance;
  const stockAfterPay = state.products.find((item) => item.id === 'product_cola_pack').stock;

  engine.requestRefund(state, { orderId: created.order.id, reason: '下错单了' });
  state.users.push({
    id: 'user_market_merchant',
    phone: '15500003333',
    nickname: '超市老板',
    role: 'merchant',
    avatarUrl: '',
    balance: 0,
    merchantId: 'merchant_night_market',
  });
  state.session.currentUserId = 'user_market_merchant';
  const refunded = engine.merchantHandleOrder(state, { orderId: created.order.id, action: 'process_refund' });

  assert.equal(refunded.status, engine.ORDER_STATUS.REFUNDED);
  assert.equal(state.products.find((item) => item.id === 'product_cola_pack').stock, stockAfterPay + 2);
  assert.ok(state.users.find((item) => item.id === 'user_buyer_demo').balance > balanceAfterPay);
});

test('merchant product validation blocks invalid price and stock', () => {
  const state = createState();
  state.session.currentUserId = 'user_merchant_demo';

  assert.throws(
    () => engine.saveMerchantProduct(state, {
      name: '坏数据',
      description: '价格非法',
      price: 0,
      stock: 1,
      unit: '份',
    }),
    /商品价格必须大于 0/,
  );

  assert.throws(
    () => engine.saveMerchantProduct(state, {
      name: '坏数据',
      description: '库存非法',
      price: 10,
      stock: -1,
      unit: '份',
    }),
    /商品库存不能为负数/,
  );
});

test('merchant cannot operate orders from another merchant', () => {
  const state = createState();
  engine.updateCartItem(state, { merchantId: 'merchant_night_market', productId: 'product_cola_pack', delta: 2 });
  const created = engine.createOrder(state, { addressId: 'address_home' });
  engine.payOrder(state, { orderId: created.order.id, paymentMethod: 'wechat' });

  state.session.currentUserId = 'user_merchant_demo';
  assert.throws(
    () => engine.merchantHandleOrder(state, { orderId: created.order.id, action: 'accept' }),
    /当前用户不是该商家管理员/,
  );
});
