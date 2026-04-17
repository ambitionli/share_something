const { ORDER_STATUS, STATUS_META } = require("./constants");

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function getNextId(state, key, prefix) {
  const nextValue = state.meta.nextIds[key];
  state.meta.nextIds[key] += 1;
  return `${prefix}_${nextValue}`;
}

function formatTime(input) {
  const date = input ? new Date(input) : new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function createOrderNo(input) {
  const date = input ? new Date(input) : new Date();
  const timestamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ].join("");
  return `HJ${timestamp}${String(date.getMilliseconds()).padStart(3, "0")}`;
}

function findUser(state, userId) {
  const user = state.users.find((item) => item.id === userId);
  assert(user, "用户不存在");
  return user;
}

function findMerchant(state, merchantId) {
  const merchant = state.merchants.find((item) => item.id === merchantId);
  assert(merchant, "商家不存在");
  return merchant;
}

function findProduct(state, productId) {
  const product = state.products.find((item) => item.id === productId);
  assert(product, "商品不存在");
  return product;
}

function findAddress(state, addressId) {
  const address = state.addresses.find((item) => item.id === addressId);
  assert(address, "收货地址不存在");
  return address;
}

function findOrder(state, orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  assert(order, "订单不存在");
  return order;
}

function ensureOrderOwnedByUser(order, userId) {
  assert(order.userId === userId, "无权操作该订单");
}

function ensureMerchantOwnsOrder(state, order, userId) {
  const merchant = findMerchant(state, order.merchantId);
  assert(merchant.ownerUserId === userId, "无权操作该商家订单");
  return merchant;
}

function appendTimeline(order, label, time) {
  order.timeline.push({
    label,
    time: formatTime(time)
  });
}

function restoreStock(state, order) {
  order.items.forEach((item) => {
    const product = findProduct(state, item.productId);
    product.stock += item.quantity;
  });
}

function calculateCartSummary(state, payload) {
  const merchant = findMerchant(state, payload.merchantId);
  const items = payload.items || [];
  assert(items.length > 0, "购物车为空，无法结算");

  const normalizedItems = items.map((item) => {
    assert(Number.isInteger(item.quantity) && item.quantity > 0, "商品数量必须为正整数");
    const product = findProduct(state, item.productId);
    assert(product.merchantId === merchant.id, "跨商家商品不能一起下单");
    assert(product.isOnShelf, `${product.name} 已下架`);
    assert(product.stock >= item.quantity, `${product.name} 库存不足`);
    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      price: product.price
    };
  });

  const itemsTotal = Number(
    normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
  );
  const deliveryFee = merchant.deliveryFee;
  let discountAmount = 0;

  if (payload.couponId) {
    const coupon = state.coupons.find((item) => item.id === payload.couponId);
    assert(coupon && coupon.userId === payload.userId, "优惠券不存在");
    assert(!coupon.isUsed, "优惠券已使用");
    assert(itemsTotal >= coupon.minimumSpend, "未达到优惠券使用门槛");
    discountAmount = coupon.amount;
  }

  const payableAmount = Number(Math.max(itemsTotal + deliveryFee - discountAmount, 0).toFixed(2));
  assert(itemsTotal >= merchant.minOrderAmount, `未达到起送价 ¥${merchant.minOrderAmount}`);

  return {
    merchant,
    items: normalizedItems,
    summary: {
      itemsTotal,
      deliveryFee,
      discountAmount,
      payableAmount
    }
  };
}

function loginUser(state, payload) {
  const nextState = cloneState(state);
  const phone = (payload.phone || "").trim();
  assert(phone.length >= 11, "手机号格式不正确");

  let user = nextState.users.find((item) => item.phone === phone);
  if (!user) {
    user = {
      id: getNextId(nextState, "user", "user"),
      nickname: payload.nickname || `用户${phone.slice(-4)}`,
      phone,
      avatarText: (payload.nickname || phone.slice(-2)).slice(0, 1),
      balance: 0,
      couponIds: []
    };
    nextState.users.push(user);
  }

  nextState.currentUserId = user.id;
  return {
    state: nextState,
    user
  };
}

function createOrder(state, payload) {
  const nextState = cloneState(state);
  const user = findUser(nextState, payload.userId);
  const address = findAddress(nextState, payload.addressId);
  assert(address.userId === user.id, "地址不属于当前用户");
  assert(payload.clientToken, "缺少幂等令牌");

  const duplicateOrder = nextState.orders.find((item) => item.clientToken === payload.clientToken);
  assert(!duplicateOrder, "请勿重复提交订单");

  const result = calculateCartSummary(nextState, payload);
  const now = payload.now || new Date();
  const order = {
    id: getNextId(nextState, "order", "order"),
    orderNo: createOrderNo(now),
    clientToken: payload.clientToken,
    userId: user.id,
    merchantId: result.merchant.id,
    addressId: payload.addressId,
    remark: payload.remark || "",
    items: result.items,
    summary: result.summary,
    status: ORDER_STATUS.PENDING_PAYMENT,
    timeline: [
      {
        label: "订单创建",
        time: formatTime(now)
      }
    ],
    reviewId: null,
    refundReason: "",
    refundContext: null,
    createdAt: formatTime(now)
  };

  result.items.forEach((item) => {
    const product = findProduct(nextState, item.productId);
    product.stock -= item.quantity;
  });

  if (payload.couponId) {
    const coupon = nextState.coupons.find((item) => item.id === payload.couponId);
    coupon.isUsed = true;
  }

  nextState.meta.orderTokenHistory.unshift(payload.clientToken);
  nextState.meta.orderTokenHistory = nextState.meta.orderTokenHistory.slice(0, 100);
  nextState.orders.unshift(order);
  nextState.cartByMerchant[result.merchant.id] = [];

  return {
    state: nextState,
    order
  };
}

function payOrder(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureOrderOwnedByUser(order, payload.userId);

  if (order.status === ORDER_STATUS.PENDING_ACCEPTANCE) {
    return {
      state: nextState,
      order,
      alreadyPaid: true
    };
  }

  assert(order.status === ORDER_STATUS.PENDING_PAYMENT, "当前订单状态不可支付");
  order.status = ORDER_STATUS.PENDING_ACCEPTANCE;
  order.paymentRef = payload.paymentRef || `PAY${Date.now()}`;
  appendTimeline(order, "支付成功", payload.now);

  const merchant = findMerchant(nextState, order.merchantId);
  order.items.forEach((item) => {
    const product = findProduct(nextState, item.productId);
    product.sales += item.quantity;
    merchant.monthlySales += item.quantity;
  });

  return {
    state: nextState,
    order,
    alreadyPaid: false
  };
}

function acceptOrder(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureMerchantOwnsOrder(nextState, order, payload.userId);
  assert(order.status === ORDER_STATUS.PENDING_ACCEPTANCE, "仅待接单订单可接单");
  order.status = ORDER_STATUS.ACCEPTED;
  appendTimeline(order, "商家已接单", payload.now);
  return { state: nextState, order };
}

function rejectOrder(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureMerchantOwnsOrder(nextState, order, payload.userId);
  assert(order.status === ORDER_STATUS.PENDING_ACCEPTANCE, "仅待接单订单可拒单");
  order.status = ORDER_STATUS.REJECTED;
  order.rejectReason = payload.reason || "商家暂时无法接单";
  appendTimeline(order, "商家拒单并发起退款", payload.now);
  restoreStock(nextState, order);
  return { state: nextState, order };
}

function markDelivering(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureMerchantOwnsOrder(nextState, order, payload.userId);
  assert(order.status === ORDER_STATUS.ACCEPTED, "仅已接单订单可标记配送");
  order.status = ORDER_STATUS.DELIVERING;
  appendTimeline(order, "骑手配送中", payload.now);
  return { state: nextState, order };
}

function completeOrder(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureOrderOwnedByUser(order, payload.userId);
  assert(order.status === ORDER_STATUS.DELIVERING, "仅配送中的订单可确认完成");
  order.status = ORDER_STATUS.COMPLETED;
  appendTimeline(order, "用户确认收货", payload.now);
  return { state: nextState, order };
}

function requestRefund(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureOrderOwnedByUser(order, payload.userId);
  const refundableStatuses = [
    ORDER_STATUS.PENDING_ACCEPTANCE,
    ORDER_STATUS.ACCEPTED,
    ORDER_STATUS.DELIVERING
  ];
  assert(refundableStatuses.includes(order.status), "当前订单不可申请退款");
  order.refundContext = {
    fromStatus: order.status,
    requestedAt: formatTime(payload.now),
    reason: payload.reason || "用户主动申请退款"
  };
  order.refundReason = payload.reason || "用户主动申请退款";
  order.status = ORDER_STATUS.REFUND_REQUESTED;
  appendTimeline(order, "用户发起退款", payload.now);
  return { state: nextState, order };
}

function handleRefund(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  ensureMerchantOwnsOrder(nextState, order, payload.userId);
  assert(order.status === ORDER_STATUS.REFUND_REQUESTED, "当前订单没有待处理退款");
  assert(order.refundContext, "退款上下文缺失");

  if (payload.approve) {
    order.status = ORDER_STATUS.REFUNDED;
    if (
      order.refundContext.fromStatus === ORDER_STATUS.PENDING_ACCEPTANCE ||
      order.refundContext.fromStatus === ORDER_STATUS.ACCEPTED
    ) {
      restoreStock(nextState, order);
    }
    appendTimeline(order, "退款完成", payload.now);
  } else {
    order.status = order.refundContext.fromStatus;
    appendTimeline(order, "商家驳回退款", payload.now);
  }

  return { state: nextState, order };
}

function submitReview(state, payload) {
  const nextState = cloneState(state);
  const order = findOrder(nextState, payload.orderId);
  assert(order.userId === payload.userId, "不能评价他人订单");
  assert(order.status === ORDER_STATUS.COMPLETED, "仅已完成订单可评价");
  assert(!order.reviewId, "该订单已评价");
  assert(payload.rating >= 1 && payload.rating <= 5, "评分必须在 1 到 5 之间");
  assert((payload.content || "").trim().length >= 5, "评价内容不少于 5 个字");

  const review = {
    id: getNextId(nextState, "review", "review"),
    orderId: order.id,
    merchantId: order.merchantId,
    userId: payload.userId,
    rating: payload.rating,
    content: payload.content.trim(),
    images: payload.images || [],
    createdAt: formatTime(payload.now)
  };

  nextState.reviews.unshift(review);
  order.reviewId = review.id;
  appendTimeline(order, "订单已评价", payload.now);

  const merchantReviews = nextState.reviews.filter((item) => item.merchantId === order.merchantId);
  const merchant = findMerchant(nextState, order.merchantId);
  merchant.rating = Number(
    (merchantReviews.reduce((sum, item) => sum + item.rating, 0) / merchantReviews.length).toFixed(1)
  );

  return {
    state: nextState,
    review,
    order
  };
}

function upsertAddress(state, payload) {
  const nextState = cloneState(state);
  const user = findUser(nextState, payload.userId);
  const addressPayload = {
    userId: user.id,
    receiver: (payload.receiver || "").trim(),
    phone: (payload.phone || "").trim(),
    detail: (payload.detail || "").trim(),
    tag: (payload.tag || "其他").trim(),
    isDefault: Boolean(payload.isDefault)
  };

  assert(addressPayload.receiver, "收货人不能为空");
  assert(addressPayload.phone.length >= 11, "手机号格式不正确");
  assert(addressPayload.detail, "详细地址不能为空");

  if (addressPayload.isDefault) {
    nextState.addresses.forEach((item) => {
      if (item.userId === user.id) {
        item.isDefault = false;
      }
    });
  }

  if (payload.id) {
    const address = findAddress(nextState, payload.id);
    assert(address.userId === user.id, "不能修改他人地址");
    Object.assign(address, addressPayload);
    return { state: nextState, address };
  }

  const address = {
    id: getNextId(nextState, "address", "address"),
    ...addressPayload
  };
  nextState.addresses.unshift(address);
  return { state: nextState, address };
}

function removeAddress(state, payload) {
  const nextState = cloneState(state);
  const address = findAddress(nextState, payload.id);
  assert(address.userId === payload.userId, "不能删除他人地址");
  nextState.addresses = nextState.addresses.filter((item) => item.id !== payload.id);
  if (address.isDefault && nextState.addresses.length > 0) {
    const firstAddress = nextState.addresses.find((item) => item.userId === payload.userId);
    if (firstAddress) {
      firstAddress.isDefault = true;
    }
  }
  return { state: nextState };
}

function submitMerchantApplication(state, payload) {
  const nextState = cloneState(state);
  const user = findUser(nextState, payload.userId);
  const existingMerchant = nextState.merchants.find((item) => item.ownerUserId === user.id);
  assert(!existingMerchant, "当前账号已拥有商家身份");

  const merchant = {
    id: getNextId(nextState, "merchant", "merchant"),
    ownerUserId: user.id,
    name: (payload.name || "").trim(),
    category: payload.category,
    rating: 5,
    monthlySales: 0,
    deliveryFee: Number(payload.deliveryFee) || 0,
    minOrderAmount: Number(payload.minOrderAmount) || 0,
    avgDeliveryMinutes: Number(payload.avgDeliveryMinutes) || 30,
    notice: (payload.notice || "").trim(),
    address: (payload.address || "").trim(),
    logoText: ((payload.name || "店").trim().slice(0, 1) || "店"),
    bannerText: "新店入驻筹备中",
    certifications: payload.certifications || [],
    joinedAt: formatTime(payload.now),
    status: "pending"
  };

  assert(merchant.name, "商家名称不能为空");
  assert(merchant.address, "商家地址不能为空");
  assert(merchant.certifications.length > 0, "请上传至少一项资质");

  nextState.merchants.unshift(merchant);
  nextState.merchantApplications.unshift({
    id: getNextId(nextState, "application", "application"),
    merchantId: merchant.id,
    userId: user.id,
    status: "pending",
    submittedAt: formatTime(payload.now)
  });

  return { state: nextState, merchant };
}

function upsertProduct(state, payload) {
  const nextState = cloneState(state);
  const merchant = findMerchant(nextState, payload.merchantId);
  assert(merchant.ownerUserId === payload.userId, "无权操作该商家商品");

  const productPayload = {
    merchantId: merchant.id,
    name: (payload.name || "").trim(),
    price: Number(payload.price),
    originalPrice: Number(payload.originalPrice || payload.price),
    stock: Number(payload.stock),
    sales: Number(payload.sales || 0),
    rating: Number(payload.rating || 5),
    isOnShelf: Boolean(payload.isOnShelf),
    description: (payload.description || "").trim(),
    tags: payload.tags || []
  };

  assert(productPayload.name, "商品名称不能为空");
  assert(productPayload.price >= 0.01, "商品价格异常");
  assert(Number.isFinite(productPayload.stock) && productPayload.stock >= 0, "库存不能为负数");

  if (payload.id) {
    const product = findProduct(nextState, payload.id);
    assert(product.merchantId === merchant.id, "不能修改其他商家的商品");
    Object.assign(product, productPayload);
    return { state: nextState, product };
  }

  const product = {
    id: getNextId(nextState, "product", "product"),
    ...productPayload
  };
  nextState.products.unshift(product);
  return { state: nextState, product };
}

function toggleProductShelf(state, payload) {
  const nextState = cloneState(state);
  const merchant = findMerchant(nextState, payload.merchantId);
  assert(merchant.ownerUserId === payload.userId, "无权操作该商家商品");
  const product = findProduct(nextState, payload.productId);
  assert(product.merchantId === merchant.id, "商品与商家不匹配");
  product.isOnShelf = Boolean(payload.isOnShelf);
  return { state: nextState, product };
}

function getMerchantStatistics(state, merchantId) {
  const merchantOrders = state.orders.filter((item) => item.merchantId === merchantId);
  const completedOrders = merchantOrders.filter((item) => item.status === ORDER_STATUS.COMPLETED);
  const refundedOrders = merchantOrders.filter(
    (item) => item.status === ORDER_STATUS.REFUNDED || item.status === ORDER_STATUS.REJECTED
  );
  const revenue = Number(
    completedOrders.reduce((sum, item) => sum + item.summary.payableAmount, 0).toFixed(2)
  );

  return {
    totalOrders: merchantOrders.length,
    completedOrders: completedOrders.length,
    refundedOrders: refundedOrders.length,
    revenue,
    sellingProducts: state.products.filter((item) => item.merchantId === merchantId && item.isOnShelf).length
  };
}

function getOrderDisplay(order) {
  return {
    ...order,
    statusLabel: STATUS_META[order.status].label,
    statusGroup: STATUS_META[order.status].group
  };
}

module.exports = {
  cloneState,
  calculateCartSummary,
  loginUser,
  createOrder,
  payOrder,
  acceptOrder,
  rejectOrder,
  markDelivering,
  completeOrder,
  requestRefund,
  handleRefund,
  submitReview,
  upsertAddress,
  removeAddress,
  submitMerchantApplication,
  upsertProduct,
  toggleProductShelf,
  getMerchantStatistics,
  getOrderDisplay,
  formatTime
};
