const test = require('node:test');
const assert = require('node:assert/strict');
const appService = require('../services/appService');

function loginBuyer() {
  appService.loginByPhone('18800000001');
}

function loginMerchant() {
  appService.loginByPhone('18800000002');
}

test.beforeEach(function () {
  appService.resetDemoData();
});

test('buyer to merchant full order lifecycle works', function () {
  loginBuyer();
  const home = appService.getHomeView({ keyword: '', category: '全部' });
  assert.equal(home.merchants.length >= 1, true);

  const merchantId = 'merchant_food';
  const merchantView = appService.getMerchantView(merchantId);
  const product = merchantView.products[0];
  appService.setCartQuantity({ merchantId: merchantId, productId: product.id, quantity: 2 });
  const checkout = appService.getCheckoutView(merchantId);
  assert.equal(checkout.cartSummary.totalCount, 2);

  const order = appService.createOrder({ merchantId: merchantId, addressId: checkout.selectedAddressId, remark: '少辣' });
  assert.equal(order.status, 'pending_payment');

  const paid = appService.payOrder(order.id);
  assert.equal(paid.status, 'pending_accept');

  loginMerchant();
  const accepted = appService.acceptOrder(order.id);
  assert.ok(accepted.acceptedAt);
  const delivering = appService.markDelivering(order.id, '测试骑手');
  assert.equal(delivering.status, 'delivering');

  loginBuyer();
  const completed = appService.confirmOrder(order.id);
  assert.equal(completed.status, 'completed');
  const reviewed = appService.submitReview({ orderId: order.id, rating: 5, content: '配送很快，商品很好吃', images: ['cloud://review1.png'] });
  assert.ok(reviewed.reviewId);
});

test('refund flow can be requested and approved', function () {
  loginBuyer();
  appService.setCartQuantity({ merchantId: 'merchant_food', productId: 'product_1', quantity: 1 });
  const checkout = appService.getCheckoutView('merchant_food');
  const order = appService.createOrder({ merchantId: 'merchant_food', addressId: checkout.selectedAddressId, remark: '' });
  appService.payOrder(order.id);
  const requested = appService.requestRefund(order.id, '临时有事');
  assert.equal(requested.refundStatus, 'requested');

  loginMerchant();
  const refunded = appService.handleRefund(order.id, true, '同意退款');
  assert.equal(refunded.status, 'refunded');
  assert.equal(refunded.paymentStatus, 'refunded');
});

test('invalid transitions and duplicate orders are blocked', function () {
  loginBuyer();
  assert.throws(function () {
    appService.setCartQuantity({ merchantId: 'merchant_food', productId: 'product_1', quantity: 9999 });
  }, /库存不足/);

  appService.setCartQuantity({ merchantId: 'merchant_food', productId: 'product_1', quantity: 1 });
  const checkout = appService.getCheckoutView('merchant_food');
  const first = appService.createOrder({ merchantId: 'merchant_food', addressId: checkout.selectedAddressId, remark: '' });

  appService.setCartQuantity({ merchantId: 'merchant_food', productId: 'product_1', quantity: 1 });
  assert.throws(function () {
    appService.createOrder({ merchantId: 'merchant_food', addressId: checkout.selectedAddressId, remark: '' });
  }, /请勿重复下单/);

  assert.throws(function () {
    appService.confirmOrder(first.id);
  }, /仅配送中订单可确认完成/);
});
