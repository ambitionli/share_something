const test = require("node:test");
const assert = require("node:assert/strict");

const core = require("../shared/core");

function createCheckoutOrder(state, options = {}) {
  core.loginWithPhone(state, {
    phone: options.phone || "13900000001",
    nickname: options.nickname || "测试用户"
  });
  const userId = state.session.currentUserId;

  core.upsertCartItem(state, {
    userId,
    productId: options.productId || "p1",
    delta: options.quantity || 2
  });

  return core.createOrder(state, {
    userId,
    addressId: options.addressId || `a${state.meta.nextAddressId - 1}` || "a203",
    remark: options.remark || "少辣",
    couponId: options.couponId || ""
  });
}

test("full order flow passes acceptance chain", () => {
  const state = core.createSeedState();
  const user = core.loginWithPhone(state, {
    phone: "13900000001",
    nickname: "测试用户"
  });
  core.saveAddress(state, {
    userId: user.id,
    name: "王五",
    phone: "13900000001",
    detail: "测试大厦 1001",
    tag: "公司",
    isDefault: true
  });

  const productBefore = state.products.find((item) => item.id === "p1").stock;
  core.upsertCartItem(state, {
    userId: user.id,
    productId: "p1",
    delta: 2
  });

  const order = core.createOrder(state, {
    userId: user.id,
    addressId: "a203",
    remark: "多放餐具",
    couponId: ""
  });

  assert.equal(order.status, core.ORDER_STATUS.PENDING_PAYMENT);
  assert.equal(state.products.find((item) => item.id === "p1").stock, productBefore - 2);

  const paid = core.payOrder(state, { userId: user.id, orderId: order.id });
  assert.equal(paid.status, core.ORDER_STATUS.PENDING_ACCEPT);

  const accepted = core.merchantAcceptOrder(state, { merchantId: order.merchantId, orderId: order.id });
  assert.equal(accepted.status, core.ORDER_STATUS.ACCEPTED);

  const delivering = core.merchantDeliverOrder(state, {
    merchantId: order.merchantId,
    orderId: order.id,
    riderName: "小李",
    courierName: "闪送"
  });
  assert.equal(delivering.status, core.ORDER_STATUS.DELIVERING);

  const completed = core.completeOrder(state, { userId: user.id, orderId: order.id });
  assert.equal(completed.status, core.ORDER_STATUS.COMPLETED);

  const review = core.submitReview(state, {
    userId: user.id,
    orderId: order.id,
    rating: 5,
    content: "很好吃",
    images: ["https://example.com/review.png"]
  });
  assert.equal(review.rating, 5);
  assert.ok(state.orders.find((item) => item.id === order.id).reviewId);
});

test("refund flow restores inventory and marks refunded", () => {
  const state = core.createSeedState();
  const user = core.loginWithPhone(state, {
    phone: "13900000002",
    nickname: "退款用户"
  });
  core.saveAddress(state, {
    userId: user.id,
    name: "赵六",
    phone: "13900000002",
    detail: "退款路 8 号",
    tag: "家",
    isDefault: true
  });

  const beforeStock = state.products.find((item) => item.id === "p20").stock;
  core.upsertCartItem(state, {
    userId: user.id,
    productId: "p20",
    delta: 1
  });
  const order = core.createOrder(state, {
    userId: user.id,
    addressId: "a203",
    remark: "",
    couponId: ""
  });
  core.payOrder(state, { userId: user.id, orderId: order.id });
  core.merchantAcceptOrder(state, { merchantId: order.merchantId, orderId: order.id });

  const refundPending = core.requestRefund(state, {
    userId: user.id,
    orderId: order.id,
    reason: "不想要了"
  });
  assert.equal(refundPending.status, core.ORDER_STATUS.REFUND_PENDING);

  const refunded = core.processRefund(state, { orderId: order.id });
  assert.equal(refunded.status, core.ORDER_STATUS.REFUNDED);
  assert.equal(state.products.find((item) => item.id === "p20").stock, beforeStock);
});

test("merchant reject refunds paid order immediately", () => {
  const state = core.createSeedState();
  const user = core.loginWithPhone(state, {
    phone: "13900000003",
    nickname: "拒单用户"
  });
  core.saveAddress(state, {
    userId: user.id,
    name: "陈七",
    phone: "13900000003",
    detail: "拒单街 1 号",
    tag: "家",
    isDefault: true
  });

  core.upsertCartItem(state, {
    userId: user.id,
    productId: "p10",
    delta: 3
  });
  const order = core.createOrder(state, {
    userId: user.id,
    addressId: "a203",
    remark: "",
    couponId: ""
  });
  core.payOrder(state, { userId: user.id, orderId: order.id });

  const rejected = core.merchantRejectOrder(state, {
    merchantId: order.merchantId,
    orderId: order.id,
    reason: "库存盘点异常"
  });
  assert.equal(rejected.status, core.ORDER_STATUS.REFUNDED);
  assert.equal(rejected.refundReason, "库存盘点异常");
});

test("cannot exceed stock or produce negative quantity", () => {
  const state = core.createSeedState();
  const user = core.loginWithPhone(state, {
    phone: "13900000004",
    nickname: "库存测试"
  });

  assert.throws(() => {
    core.upsertCartItem(state, {
      userId: user.id,
      productId: "p31",
      delta: 999
    });
  }, /超过库存/);

  assert.throws(() => {
    core.upsertCartItem(state, {
      userId: user.id,
      productId: "p31",
      delta: -1
    });
  }, /不能为负数/);
});

test("coupon discount reduces total and cancellation restores coupon", () => {
  const state = core.createSeedState();
  const userId = "u1";
  state.session.currentUserId = userId;

  core.upsertCartItem(state, { userId, productId: "p1", delta: 1 });
  core.upsertCartItem(state, { userId, productId: "p2", delta: 1 });

  const order = core.createOrder(state, {
    userId,
    addressId: "a201",
    remark: "",
    couponId: "c1"
  });

  assert.equal(order.discountAmount, 10);
  assert.equal(order.totalAmount, 34);
  assert.equal(state.coupons.find((item) => item.id === "c1").used, true);

  const cancelled = core.cancelUnpaidOrder(state, {
    userId,
    orderId: order.id
  });
  assert.equal(cancelled.status, core.ORDER_STATUS.CANCELLED);
  assert.equal(state.coupons.find((item) => item.id === "c1").used, false);
});

test("merchant onboarding, product management, dashboard stats and settings work", () => {
  const state = core.createSeedState();
  const user = core.loginWithPhone(state, {
    phone: "13900000005",
    nickname: "新商家"
  });

  const applicationResult = core.createMerchantApplication(state, {
    userId: user.id,
    name: "晨光超市",
    categoryId: "market",
    announcement: "新店开业",
    qualificationImages: ["https://example.com/license.png"]
  });
  assert.equal(applicationResult.application.status, "approved");
  assert.ok(applicationResult.merchant.id);

  const product = core.upsertMerchantProduct(state, {
    merchantId: applicationResult.merchant.id,
    name: "鲜牛奶",
    description: "当天冷链",
    price: 12,
    stock: 20,
    onShelf: true
  });
  assert.equal(product.price, 12);

  const updated = core.upsertMerchantProduct(state, {
    merchantId: applicationResult.merchant.id,
    id: product.id,
    name: "鲜牛奶 950ml",
    description: "升级规格",
    price: 13,
    stock: 18,
    onShelf: false
  });
  assert.equal(updated.onShelf, false);

  const toggled = core.toggleProductShelf(state, {
    merchantId: applicationResult.merchant.id,
    productId: product.id,
    onShelf: true
  });
  assert.equal(toggled.onShelf, true);

  const settings = core.updateSettings(state, {
    notifications: false,
    darkMode: true
  });
  assert.equal(settings.notifications, false);
  assert.equal(settings.darkMode, true);

  const dashboard = core.getMerchantDashboard(state, applicationResult.merchant.id);
  assert.equal(dashboard.overview.activeProducts, 1);
});
