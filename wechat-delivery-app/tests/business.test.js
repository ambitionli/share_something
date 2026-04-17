const test = require("node:test");
const assert = require("node:assert/strict");

const { ORDER_STATUS } = require("../shared/constants");
const { createSeedState } = require("../shared/seed");
const business = require("../shared/business");

function createOrderFlow(stateOverrides) {
  const state = Object.assign(createSeedState(), stateOverrides || {});
  const created = business.createOrder(state, {
    userId: "user_1",
    merchantId: "merchant_1",
    addressId: "address_1",
    items: [
      {
        productId: "product_1",
        quantity: 1
      },
      {
        productId: "product_2",
        quantity: 1
      }
    ],
    remark: "少冰",
    clientToken: "order-token-1",
    now: new Date("2026-04-16T12:00:00Z")
  });
  return created;
}

test("createOrder prevents duplicate submissions via clientToken", () => {
  const initial = createSeedState();
  const first = business.createOrder(initial, {
    userId: "user_1",
    merchantId: "merchant_1",
    addressId: "address_1",
    items: [{ productId: "product_1", quantity: 2 }],
    clientToken: "dup-1"
  });

  assert.throws(() => {
    business.createOrder(first.state, {
      userId: "user_1",
      merchantId: "merchant_1",
      addressId: "address_1",
      items: [{ productId: "product_1", quantity: 2 }],
      clientToken: "dup-1"
    });
  }, /重复提交订单/);
});

test("createOrder rejects negative or invalid stock scenarios", () => {
  const initial = createSeedState();
  assert.throws(() => {
    business.createOrder(initial, {
      userId: "user_1",
      merchantId: "merchant_1",
      addressId: "address_1",
      items: [{ productId: "product_1", quantity: 999 }],
      clientToken: "too-many"
    });
  }, /库存不足/);
});

test("payOrder is idempotent and does not double count sales", () => {
  const created = createOrderFlow();
  const paid = business.payOrder(created.state, {
    userId: "user_1",
    orderId: created.order.id,
    paymentRef: "PAY-100"
  });

  assert.equal(paid.order.status, ORDER_STATUS.PENDING_ACCEPTANCE);
  const productAfterFirstPay = paid.state.products.find((item) => item.id === "product_1");
  assert.equal(productAfterFirstPay.sales, 213);

  const paidAgain = business.payOrder(paid.state, {
    userId: "user_1",
    orderId: created.order.id,
    paymentRef: "PAY-100"
  });
  const productAfterSecondPay = paidAgain.state.products.find((item) => item.id === "product_1");

  assert.equal(paidAgain.alreadyPaid, true);
  assert.equal(productAfterSecondPay.sales, 213);
});

test("refund approval restores stock for not-yet-delivered order", () => {
  const created = createOrderFlow();
  const paid = business.payOrder(created.state, {
    userId: "user_1",
    orderId: created.order.id
  });
  const accepted = business.acceptOrder(paid.state, {
    userId: "user_2",
    orderId: created.order.id
  });
  const refundRequested = business.requestRefund(accepted.state, {
    userId: "user_1",
    orderId: created.order.id,
    reason: "不想要了"
  });
  const refunded = business.handleRefund(refundRequested.state, {
    userId: "user_2",
    orderId: created.order.id,
    approve: true
  });

  const product = refunded.state.products.find((item) => item.id === "product_1");
  assert.equal(refunded.order.status, ORDER_STATUS.REFUNDED);
  assert.equal(product.stock, 38);
});

test("completed order can be reviewed once only", () => {
  const created = createOrderFlow();
  const paid = business.payOrder(created.state, {
    userId: "user_1",
    orderId: created.order.id
  });
  const accepted = business.acceptOrder(paid.state, {
    userId: "user_2",
    orderId: created.order.id
  });
  const delivering = business.markDelivering(accepted.state, {
    userId: "user_2",
    orderId: created.order.id
  });
  const completed = business.completeOrder(delivering.state, {
    userId: "user_1",
    orderId: created.order.id
  });
  const reviewed = business.submitReview(completed.state, {
    userId: "user_1",
    orderId: created.order.id,
    rating: 5,
    content: "配送非常快，包装也很好",
    images: ["proof.jpg"]
  });

  assert.equal(reviewed.review.rating, 5);
  assert.throws(() => {
    business.submitReview(reviewed.state, {
      userId: "user_1",
      orderId: created.order.id,
      rating: 4,
      content: "再次评价"
    });
  }, /已评价/);
});

test("merchant cannot operate on another merchant order", () => {
  const seed = createSeedState();
  seed.users.push({
    id: "user_3",
    nickname: "第二商家",
    phone: "13700137000",
    avatarText: "二",
    balance: 0,
    couponIds: []
  });
  seed.merchants = seed.merchants.map((item) => {
    if (item.id === "merchant_2") {
      return {
        ...item,
        ownerUserId: "user_3"
      };
    }
    return item;
  });

  const created = business.createOrder(seed, {
    userId: "user_1",
    merchantId: "merchant_2",
    addressId: "address_1",
    items: [{ productId: "product_4", quantity: 2 }],
    clientToken: "merchant-2"
  });
  const paid = business.payOrder(created.state, {
    userId: "user_1",
    orderId: created.order.id
  });

  assert.throws(() => {
    business.acceptOrder(paid.state, {
      userId: "user_2",
      orderId: created.order.id
    });
  }, /无权操作该商家订单/);
});

test("user cannot confirm another user's order", () => {
  const seed = createSeedState();
  seed.users.push({
    id: "user_3",
    nickname: "路人甲",
    phone: "13700137000",
    avatarText: "路",
    balance: 0,
    couponIds: []
  });

  const created = business.createOrder(seed, {
    userId: "user_1",
    merchantId: "merchant_1",
    addressId: "address_1",
    items: [{ productId: "product_1", quantity: 2 }],
    clientToken: "foreign-user"
  });
  const paid = business.payOrder(created.state, {
    userId: "user_1",
    orderId: created.order.id
  });
  const accepted = business.acceptOrder(paid.state, {
    userId: "user_2",
    orderId: created.order.id
  });
  const delivering = business.markDelivering(accepted.state, {
    userId: "user_2",
    orderId: created.order.id
  });

  assert.throws(() => {
    business.completeOrder(delivering.state, {
      userId: "user_3",
      orderId: created.order.id
    });
  }, /无权操作该订单/);
});
