const test = require("node:test");
const assert = require("node:assert/strict");

const engine = require("../shared/order-engine");
const { createSeedData, ORDER_STATUS } = require("../shared/seed");

function setup() {
  return createSeedData();
}

function addToCart(db, { userId, merchantId, productId, quantity }) {
  for (let index = 0; index < quantity; index += 1) {
    const result = engine.updateCartItem(db, {
      userId,
      merchantId,
      productId,
      delta: 1
    });
    db = result.db;
  }
  return db;
}

test("完整下单链路：加购 -> 下单 -> 支付 -> 接单 -> 配送 -> 完成 -> 评价", async () => {
  let db = setup();

  db = addToCart(db, {
    userId: "u0001",
    merchantId: "m0001",
    productId: "p0001",
    quantity: 2
  });
  db = addToCart(db, {
    userId: "u0001",
    merchantId: "m0001",
    productId: "p0003",
    quantity: 1
  });

  const createResult = engine.createOrder(db, {
    userId: "u0001",
    merchantId: "m0001",
    addressId: "a0001",
    remark: "少辣",
    submitToken: "submit-flow-1"
  });
  db = createResult.db;

  assert.equal(createResult.order.status, ORDER_STATUS.PENDING_PAYMENT);
  assert.equal(createResult.order.items.length, 2);

  const orderId = createResult.order.id;
  const productBeforePay = db.products.find((item) => item.id === "p0001");
  assert.equal(productBeforePay.stock, 58);

  const payResult = engine.payOrder(db, {
    userId: "u0001",
    orderId
  });
  db = payResult.db;
  assert.equal(payResult.order.status, ORDER_STATUS.PENDING_ACCEPT);

  const acceptResult = engine.merchantAcceptOrder(db, {
    merchantId: "m0001",
    orderId
  });
  db = acceptResult.db;
  assert.equal(acceptResult.order.status, ORDER_STATUS.ACCEPTED);

  const dispatchResult = engine.merchantDispatchOrder(db, {
    merchantId: "m0001",
    orderId
  });
  db = dispatchResult.db;
  assert.equal(dispatchResult.order.status, ORDER_STATUS.DELIVERING);

  const confirmResult = engine.confirmOrder(db, {
    userId: "u0001",
    orderId
  });
  db = confirmResult.db;
  assert.equal(confirmResult.order.status, ORDER_STATUS.COMPLETED);

  const reviewResult = engine.submitReview(db, {
    userId: "u0001",
    orderId,
    score: 5,
    content: "骑手很快，味道不错",
    images: ["https://example.com/review-1.png"]
  });
  db = reviewResult.db;

  assert.equal(reviewResult.order.reviewed, true);
  assert.equal(db.reviews.length, 1);
  assert.equal(db.reviews[0].score, 5);
  assert.ok(reviewResult.order.timeline.some((item) => item.label === "评价完成"));
});

test("退款链路：用户申请退款 -> 商家同意 -> 状态更新", async () => {
  let db = setup();

  db = addToCart(db, {
    userId: "u0001",
    merchantId: "m0001",
    productId: "p0002",
    quantity: 1
  });

  let result = engine.createOrder(db, {
    userId: "u0001",
    merchantId: "m0001",
    addressId: "a0001",
    remark: "",
    submitToken: "submit-refund-1"
  });
  db = result.db;
  const orderId = result.order.id;

  result = engine.payOrder(db, {
    userId: "u0001",
    orderId
  });
  db = result.db;

  result = engine.requestRefund(db, {
    userId: "u0001",
    orderId,
    reason: "不想要了"
  });
  db = result.db;
  assert.equal(result.order.status, ORDER_STATUS.REFUND_REQUESTED);

  result = engine.processRefund(db, {
    merchantId: "m0001",
    orderId,
    approve: true,
    reason: "同意退款"
  });
  db = result.db;
  assert.equal(result.order.status, ORDER_STATUS.REFUNDED);
  assert.equal(result.order.refund.status, ORDER_STATUS.REFUNDED);
});

test("幂等下单：同一个 submitToken 不会重复创建订单", async () => {
  let db = setup();

  db = addToCart(db, {
    userId: "u0001",
    merchantId: "m0002",
    productId: "p0004",
    quantity: 2
  });

  const first = engine.createOrder(db, {
    userId: "u0001",
    merchantId: "m0002",
    addressId: "a0001",
    submitToken: "same-token"
  });
  db = first.db;

  const second = engine.createOrder(db, {
    userId: "u0001",
    merchantId: "m0002",
    addressId: "a0001",
    submitToken: "same-token"
  });

  assert.equal(second.idempotent, true);
  assert.equal(second.order.id, first.order.id);
  assert.equal(second.db.orders.length, 1);
});

test("库存保护：不能加购超库存，也不能创建负库存商品", async () => {
  let db = setup();

  assert.throws(() => {
    engine.upsertProduct(db, {
      merchantId: "m0001",
      product: {
        name: "非法商品",
        price: 10,
        stock: -1
      }
    });
  }, /库存不能为负数/);

  assert.throws(() => {
    engine.updateCartItem(db, {
      userId: "u0001",
      merchantId: "m0004",
      productId: "p0010",
      delta: 999
    });
  }, /库存不足/);
});

test("商家可编辑商品并上下架，买家首页搜索结果随之变化", async () => {
  let db = setup();

  let merchantResult = engine.upsertProduct(db, {
    merchantId: "m0001",
    product: {
      name: "商家自制热豆浆",
      price: 6,
      originalPrice: 8,
      stock: 12,
      onShelf: true
    }
  });
  db = merchantResult.db;

  const created = merchantResult.products.find((item) => item.name === "商家自制热豆浆");
  assert.ok(created);

  let home = engine.getHomeData(db, {
    keyword: "热豆浆",
    category: "restaurant"
  });
  assert.equal(home.merchants.length >= 1, true);

  const toggleResult = engine.toggleProductShelf(db, {
    merchantId: "m0001",
    productId: created.id,
    onShelf: false
  });
  db = toggleResult.db;

  home = engine.getHomeData(db, {
    keyword: "热豆浆",
    category: "restaurant"
  });
  assert.equal(home.merchants.some((item) => item.id === "m0001"), false);
});
