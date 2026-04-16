const {
  ORDER_STATUS,
  STATUS_LABELS,
  PRODUCT_STATUS,
  MERCHANT_STATUS,
  ORDER_TAB_DEFS,
} = require('./constants');

function appError(code, message, extra) {
  const error = new Error(message);
  error.code = code;
  if (extra) {
    error.extra = extra;
  }
  return error;
}

function assert(condition, code, message, extra) {
  if (!condition) {
    throw appError(code, message, extra);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nextTimestamp(state) {
  const index = state.meta.tick;
  state.meta.tick += 1;
  return new Date(state.meta.timeSeed + index * state.meta.timeStepMs).toISOString();
}

function allocateId(state, bucket) {
  const nextId = state.meta.nextIds[bucket] || 1;
  state.meta.nextIds[bucket] = nextId + 1;
  return `${bucket}_${String(nextId).padStart(4, '0')}`;
}

function getCurrentUser(state) {
  const currentUserId = state.session.currentUserId;
  return state.users.find((item) => item.id === currentUserId) || null;
}

function ensureCurrentUser(state) {
  const user = getCurrentUser(state);
  assert(user, 'AUTH_REQUIRED', '请先登录后再继续');
  return user;
}

function getMerchant(state, merchantId) {
  const merchant = state.merchants.find((item) => item.id === merchantId);
  assert(merchant, 'MERCHANT_NOT_FOUND', '商家不存在');
  return merchant;
}

function assertMerchantOwnership(actor, merchant) {
  const ownsMerchant = actor.merchantId === merchant.id || merchant.ownerUserId === actor.id;
  assert(ownsMerchant, 'MERCHANT_PERMISSION_DENIED', '当前用户不是该商家管理员');
}

function getProduct(state, productId) {
  const product = state.products.find((item) => item.id === productId);
  assert(product, 'PRODUCT_NOT_FOUND', '商品不存在');
  return product;
}

function getOrder(state, orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  assert(order, 'ORDER_NOT_FOUND', '订单不存在');
  return order;
}

function getCoupon(state, couponId) {
  const coupon = state.coupons.find((item) => item.id === couponId);
  assert(coupon, 'COUPON_NOT_FOUND', '优惠券不存在');
  return coupon;
}

function getAddress(state, addressId) {
  const address = state.addresses.find((item) => item.id === addressId);
  assert(address, 'ADDRESS_NOT_FOUND', '地址不存在');
  return address;
}

function formatOrderStatus(status) {
  return STATUS_LABELS[status] || status;
}

function statusBelongsToTab(status, tabId) {
  if (tabId === 'all') {
    return true;
  }
  if (tabId === 'refund') {
    return [ORDER_STATUS.REFUNDING, ORDER_STATUS.REFUNDED, ORDER_STATUS.REJECTED].includes(status);
  }
  if (tabId === ORDER_STATUS.DELIVERING) {
    return [ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING].includes(status);
  }
  return status === tabId;
}

function buildOrderActions(order) {
  const actions = [];
  if (order.status === ORDER_STATUS.PENDING_PAY) {
    actions.push('pay');
  }
  if ([ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING].includes(order.status)) {
    actions.push('refund');
  }
  if (order.status === ORDER_STATUS.DELIVERING) {
    actions.push('complete');
  }
  if (order.status === ORDER_STATUS.COMPLETED && !order.reviewId) {
    actions.push('review');
  }
  return actions;
}

function getMerchantProducts(state, merchantId) {
  return state.products.filter((item) => item.merchantId === merchantId);
}

function getReviewStats(state, merchantId) {
  const merchantReviews = state.reviews.filter((item) => item.merchantId === merchantId);
  if (!merchantReviews.length) {
    return { average: 0, count: 0 };
  }
  const total = merchantReviews.reduce((sum, item) => sum + item.rating, 0);
  return {
    average: Number((total / merchantReviews.length).toFixed(1)),
    count: merchantReviews.length,
  };
}

function buildCartItems(state) {
  const cart = state.cart || { items: [], merchantId: '', remark: '' };
  return cart.items
    .map((entry) => {
      const product = getProduct(state, entry.productId);
      return {
        productId: product.id,
        merchantId: product.merchantId,
        name: product.name,
        price: product.price,
        unit: product.unit,
        stock: product.stock,
        quantity: entry.quantity,
        amount: Number((product.price * entry.quantity).toFixed(2)),
      };
    })
    .filter((item) => item.quantity > 0);
}

function quoteCheckout(state, input) {
  const user = ensureCurrentUser(state);
  const cartItems = buildCartItems(state);
  assert(cartItems.length > 0, 'CART_EMPTY', '购物车还是空的');
  const merchant = getMerchant(state, state.cart.merchantId);
  const addressId = input && input.addressId ? input.addressId : null;
  const couponId = input && input.couponId ? input.couponId : null;

  const subtotal = Number(cartItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  assert(subtotal >= merchant.minOrderAmount, 'MIN_ORDER_NOT_REACHED', `未达到起送价 ${merchant.minOrderAmount} 元`);

  let discount = 0;
  let selectedCoupon = null;
  if (couponId) {
    selectedCoupon = getCoupon(state, couponId);
    assert(selectedCoupon.userId === user.id, 'COUPON_OWNER_INVALID', '当前优惠券不可用');
    assert(selectedCoupon.status === 'unused', 'COUPON_ALREADY_USED', '该优惠券已被使用');
    assert(subtotal >= selectedCoupon.minSpend, 'COUPON_MIN_SPEND', `订单未满足满 ${selectedCoupon.minSpend} 元使用条件`);
    discount = selectedCoupon.amount;
  }

  const deliveryFee = merchant.deliveryFee;
  const total = Number((subtotal + deliveryFee - discount).toFixed(2));
  assert(total >= 0, 'TOTAL_INVALID', '订单金额异常');

  return {
    merchant: clone(merchant),
    items: cartItems,
    address: addressId ? clone(getAddress(state, addressId)) : null,
    coupon: selectedCoupon ? clone(selectedCoupon) : null,
    subtotal,
    deliveryFee,
    discount,
    total,
  };
}

function buildOrderSummary(order) {
  return {
    ...clone(order),
    statusLabel: formatOrderStatus(order.status),
    actionKeys: buildOrderActions(order),
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

function loginWithPhone(state, payload) {
  const phone = String(payload.phone || '').trim();
  const nickname = String(payload.nickname || '').trim() || '新用户';
  const role = payload.role === 'merchant' ? 'merchant' : 'buyer';
  assert(/^1\d{10}$/.test(phone), 'PHONE_INVALID', '请输入正确的手机号');

  let user = state.users.find((item) => item.phone === phone);
  if (!user) {
    user = {
      id: allocateId(state, 'user'),
      phone,
      nickname,
      role,
      avatarUrl: '',
      balance: role === 'merchant' ? 60 : 100,
      merchantId: '',
    };
    state.users.push(user);
  } else if (nickname) {
    user.nickname = nickname;
  }

  if (role === 'merchant' && !user.merchantId) {
    user.role = 'merchant';
  }

  state.session.currentUserId = user.id;
  return clone(user);
}

function loginWithWechat(state, payload) {
  const nickname = String(payload.nickname || '').trim() || '微信用户';
  let user = state.users.find((item) => item.nickname === nickname && item.phone === '');
  if (!user) {
    user = {
      id: allocateId(state, 'user'),
      phone: '',
      nickname,
      role: 'buyer',
      avatarUrl: payload.avatarUrl || '',
      balance: 88,
      merchantId: '',
    };
    state.users.push(user);
  }
  state.session.currentUserId = user.id;
  return clone(user);
}

function logout(state) {
  state.session.currentUserId = '';
}

function listHomeMerchants(state, query) {
  const keyword = String((query && query.keyword) || '').trim().toLowerCase();
  const category = query && query.category ? query.category : 'all';
  const merchants = state.merchants
    .filter((item) => item.status === MERCHANT_STATUS.APPROVED)
    .filter((item) => {
      if (category !== 'all' && item.category !== category) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      return item.name.toLowerCase().includes(keyword) || item.notice.toLowerCase().includes(keyword);
    })
    .map((merchant) => ({
      ...clone(merchant),
      statusLabel: formatOrderStatus(merchant.status),
    }));

  return {
    banners: clone(state.banners),
    categories: clone(state.categories),
    merchants,
    tabs: clone(ORDER_TAB_DEFS),
  };
}

function getMerchantDetail(state, merchantId) {
  const merchant = getMerchant(state, merchantId);
  const reviewStats = getReviewStats(state, merchantId);
  const reviews = state.reviews
    .filter((item) => item.merchantId === merchantId)
    .slice(-3)
    .map((item) => clone(item));
  const products = getMerchantProducts(state, merchantId).map((item) => ({
    ...clone(item),
    statusLabel: formatOrderStatus(item.status),
  }));
  const cartItems = buildCartItems(state).filter((item) => item.merchantId === merchantId);
  return {
    merchant: {
      ...clone(merchant),
      reviewCount: reviewStats.count,
      dynamicScore: reviewStats.count ? reviewStats.average : merchant.score,
    },
    products,
    reviews,
    cartItems,
  };
}

function setCartRemark(state, payload) {
  state.cart.remark = String(payload.remark || '').trim();
  return clone(state.cart);
}

function clearCart(state) {
  state.cart = {
    merchantId: '',
    remark: '',
    items: [],
  };
  return clone(state.cart);
}

function updateCartItem(state, payload) {
  const merchantId = payload.merchantId;
  const productId = payload.productId;
  const delta = Number(payload.delta || 0);
  const replaceMerchantCart = Boolean(payload.replaceMerchantCart);
  const product = getProduct(state, productId);

  assert(product.merchantId === merchantId, 'CART_MERCHANT_INVALID', '商品与商家不匹配');
  assert(product.status === PRODUCT_STATUS.ON_SALE, 'PRODUCT_OFF_SALE', '商品已下架');
  assert(delta !== 0, 'DELTA_INVALID', '购物车数量变更无效');

  if (state.cart.merchantId && state.cart.merchantId !== merchantId && state.cart.items.length > 0) {
    assert(replaceMerchantCart, 'CART_MERCHANT_CONFLICT', '一次只能结算一家商家，是否清空当前购物车并切换？', {
      currentMerchantId: state.cart.merchantId,
      targetMerchantId: merchantId,
    });
    clearCart(state);
  }

  state.cart.merchantId = merchantId;
  const itemIndex = state.cart.items.findIndex((item) => item.productId === productId);
  const existing = itemIndex >= 0 ? state.cart.items[itemIndex] : null;
  const nextQuantity = (existing ? existing.quantity : 0) + delta;

  assert(nextQuantity >= 0, 'QUANTITY_INVALID', '购物车数量不能为负数');
  assert(nextQuantity <= product.stock, 'STOCK_NOT_ENOUGH', '库存不足，无法继续加购');

  if (nextQuantity === 0) {
    state.cart.items = state.cart.items.filter((item) => item.productId !== productId);
  } else if (existing) {
    existing.quantity = nextQuantity;
  } else {
    state.cart.items.push({ productId, quantity: nextQuantity });
  }

  if (!state.cart.items.length) {
    state.cart.merchantId = '';
    state.cart.remark = '';
  }

  return getCartSummary(state);
}

function getCartSummary(state) {
  const merchant = state.cart.merchantId ? getMerchant(state, state.cart.merchantId) : null;
  const items = buildCartItems(state);
  const subtotal = Number(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return {
    merchant: merchant ? clone(merchant) : null,
    items,
    remark: state.cart.remark,
    subtotal,
    itemCount,
  };
}

function createOrder(state, payload) {
  const user = ensureCurrentUser(state);
  const addressId = payload.addressId;
  const couponId = payload.couponId || '';
  const remark = String(payload.remark || state.cart.remark || '').trim();
  const preview = quoteCheckout(state, { addressId, couponId });
  const signature = JSON.stringify({
    userId: user.id,
    merchantId: preview.merchant.id,
    items: preview.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    addressId,
    couponId,
    remark,
  });

  const duplicated = state.orders.find(
    (item) => item.userId === user.id && item.status === ORDER_STATUS.PENDING_PAY && item.signature === signature,
  );
  if (duplicated) {
    return {
      order: buildOrderSummary(duplicated),
      duplicated: true,
    };
  }

  const createdAt = nextTimestamp(state);
  const order = {
    id: allocateId(state, 'order'),
    orderNo: `LLJD${String(state.meta.tick).padStart(6, '0')}`,
    userId: user.id,
    merchantId: preview.merchant.id,
    merchantName: preview.merchant.name,
    status: ORDER_STATUS.PENDING_PAY,
    paymentMethod: '',
    paymentId: '',
    address: preview.address,
    items: preview.items.map((item) => ({
      ...item,
      productName: item.name,
      unitPrice: item.price,
    })),
    totals: {
      subtotal: preview.subtotal,
      deliveryFee: preview.deliveryFee,
      discount: preview.discount,
      total: preview.total,
    },
    couponId,
    remark,
    timeline: [
      {
        key: 'submitted',
        label: '订单已创建，待支付',
        at: createdAt,
      },
    ],
    courier: null,
    createdAt,
    updatedAt: createdAt,
    reviewId: '',
    signature,
  };

  state.orders.unshift(order);
  clearCart(state);

  return {
    order: buildOrderSummary(order),
    duplicated: false,
  };
}

function payOrder(state, payload) {
  const order = getOrder(state, payload.orderId);
  const user = ensureCurrentUser(state);
  assert(order.userId === user.id, 'ORDER_OWNER_INVALID', '无法支付他人的订单');

  if (order.status !== ORDER_STATUS.PENDING_PAY) {
    assert(
      [ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING, ORDER_STATUS.COMPLETED, ORDER_STATUS.REFUNDING, ORDER_STATUS.REFUNDED].includes(order.status),
      'ORDER_STATUS_INVALID',
      '当前订单不可支付',
    );
    return buildOrderSummary(order);
  }

  order.items.forEach((item) => {
    const product = getProduct(state, item.productId);
    assert(product.stock >= item.quantity, 'STOCK_NOT_ENOUGH', `${product.name} 库存不足`);
  });

  const paymentMethod = payload.paymentMethod || 'wechat';
  if (paymentMethod === 'balance') {
    assert(user.balance >= order.totals.total, 'BALANCE_NOT_ENOUGH', '余额不足，无法完成支付');
    user.balance = Number((user.balance - order.totals.total).toFixed(2));
  }

  order.items.forEach((item) => {
    const product = getProduct(state, item.productId);
    product.stock -= item.quantity;
    product.sales += item.quantity;
  });

  if (order.couponId) {
    const coupon = getCoupon(state, order.couponId);
    coupon.status = 'used';
  }

  const paidAt = nextTimestamp(state);
  order.paymentMethod = paymentMethod;
  order.paymentId = `PAY${String(state.meta.tick).padStart(8, '0')}`;
  order.status = ORDER_STATUS.PENDING_ACCEPT;
  order.updatedAt = paidAt;
  order.timeline.push({
    key: 'paid',
    label: paymentMethod === 'balance' ? '余额支付成功，等待商家接单' : '模拟微信支付成功，等待商家接单',
    at: paidAt,
  });
  return buildOrderSummary(order);
}

function buildRefundRecord(state, order, reason) {
  return {
    id: allocateId(state, 'refund'),
    orderId: order.id,
    userId: order.userId,
    merchantId: order.merchantId,
    reason: reason || '用户主动申请',
    status: 'pending',
    amount: order.totals.total,
    createdAt: nextTimestamp(state),
    processedAt: '',
  };
}

function requestRefund(state, payload) {
  const order = getOrder(state, payload.orderId);
  const user = ensureCurrentUser(state);
  assert(order.userId === user.id, 'ORDER_OWNER_INVALID', '无法退款他人的订单');
  assert(
    [ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING].includes(order.status),
    'REFUND_STATUS_INVALID',
    '当前订单暂不支持退款',
  );
  const existing = state.refunds.find((item) => item.orderId === order.id && item.status === 'pending');
  if (!existing) {
    state.refunds.unshift(buildRefundRecord(state, order, payload.reason));
  }
  order.status = ORDER_STATUS.REFUNDING;
  order.updatedAt = nextTimestamp(state);
  order.timeline.push({
    key: 'refund_request',
    label: `用户申请退款：${payload.reason || '订单变更'}`,
    at: order.updatedAt,
  });
  return buildOrderSummary(order);
}

function processRefund(state, payload) {
  const order = getOrder(state, payload.orderId);
  assert(order.status === ORDER_STATUS.REFUNDING, 'REFUND_STATUS_INVALID', '当前订单没有待处理退款');
  const refund = state.refunds.find((item) => item.orderId === order.id && item.status === 'pending');
  assert(refund, 'REFUND_NOT_FOUND', '退款记录不存在');

  const user = state.users.find((item) => item.id === order.userId);
  order.items.forEach((item) => {
    const product = getProduct(state, item.productId);
    product.stock += item.quantity;
    product.sales = Math.max(0, product.sales - item.quantity);
  });

  if (order.paymentMethod === 'balance' && user) {
    user.balance = Number((user.balance + order.totals.total).toFixed(2));
  }

  refund.status = 'completed';
  refund.processedAt = nextTimestamp(state);
  order.status = ORDER_STATUS.REFUNDED;
  order.updatedAt = nextTimestamp(state);
  order.timeline.push({
    key: 'refund_done',
    label: payload.note ? `退款完成：${payload.note}` : '退款已完成并回退库存',
    at: order.updatedAt,
  });
  return buildOrderSummary(order);
}

function merchantHandleOrder(state, payload) {
  const action = payload.action;
  const order = getOrder(state, payload.orderId);
  const merchant = getMerchant(state, order.merchantId);
  const actor = ensureCurrentUser(state);
  assertMerchantOwnership(actor, merchant);

  if (action === 'accept') {
    assert(order.status === ORDER_STATUS.PENDING_ACCEPT, 'ORDER_STATUS_INVALID', '只有待接单订单才能接单');
    order.status = ORDER_STATUS.ACCEPTED;
    order.updatedAt = nextTimestamp(state);
    order.timeline.push({
      key: 'accepted',
      label: '商家已接单，正在准备出餐',
      at: order.updatedAt,
    });
    return buildOrderSummary(order);
  }

  if (action === 'reject') {
    assert([ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED].includes(order.status), 'ORDER_STATUS_INVALID', '当前订单不能拒单');
    if (!state.refunds.find((item) => item.orderId === order.id && item.status === 'completed')) {
      const reason = payload.reason || '商家拒单';
      state.refunds.unshift(buildRefundRecord(state, order, reason));
    }
    order.status = ORDER_STATUS.REFUNDING;
    order.updatedAt = nextTimestamp(state);
    order.timeline.push({
      key: 'reject',
      label: `商家拒单：${payload.reason || '超出配送范围'}`,
      at: order.updatedAt,
    });
    return processRefund(state, { orderId: order.id, note: '商家拒单自动退款' });
  }

  if (action === 'deliver') {
    assert(order.status === ORDER_STATUS.ACCEPTED, 'ORDER_STATUS_INVALID', '请先接单再标记配送');
    order.status = ORDER_STATUS.DELIVERING;
    order.courier = {
      name: payload.courierName || '配送专员',
      phone: payload.courierPhone || '400-888-8888',
    };
    order.updatedAt = nextTimestamp(state);
    order.timeline.push({
      key: 'delivering',
      label: `骑手 ${order.courier.name} 正在配送`,
      at: order.updatedAt,
    });
    return buildOrderSummary(order);
  }

  if (action === 'process_refund') {
    return processRefund(state, { orderId: order.id, note: payload.note || '商家已处理退款' });
  }

  throw appError('MERCHANT_ACTION_INVALID', '未知的商家操作');
}

function completeOrder(state, payload) {
  const order = getOrder(state, payload.orderId);
  const user = ensureCurrentUser(state);
  assert(order.userId === user.id, 'ORDER_OWNER_INVALID', '无法完成他人的订单');
  assert([ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING].includes(order.status), 'ORDER_STATUS_INVALID', '当前订单不能确认送达');
  order.status = ORDER_STATUS.COMPLETED;
  order.updatedAt = nextTimestamp(state);
  order.timeline.push({
    key: 'completed',
    label: '用户确认收货，订单完成',
    at: order.updatedAt,
  });
  return buildOrderSummary(order);
}

function submitReview(state, payload) {
  const order = getOrder(state, payload.orderId);
  const user = ensureCurrentUser(state);
  assert(order.userId === user.id, 'ORDER_OWNER_INVALID', '无法评价他人的订单');
  assert(order.status === ORDER_STATUS.COMPLETED, 'ORDER_STATUS_INVALID', '只有已完成订单才能评价');
  assert(!order.reviewId, 'ORDER_ALREADY_REVIEWED', '订单已评价');

  const rating = Number(payload.rating || 0);
  const content = String(payload.content || '').trim();
  assert(rating >= 1 && rating <= 5, 'REVIEW_RATING_INVALID', '请填写 1-5 星评分');
  assert(content.length >= 2, 'REVIEW_CONTENT_INVALID', '评价内容至少需要 2 个字');

  const review = {
    id: allocateId(state, 'review'),
    orderId: order.id,
    userId: user.id,
    merchantId: order.merchantId,
    nickname: user.nickname,
    rating,
    content,
    images: Array.isArray(payload.images) ? payload.images.slice(0, 3) : [],
    createdAt: nextTimestamp(state),
  };
  state.reviews.unshift(review);
  order.reviewId = review.id;
  order.updatedAt = nextTimestamp(state);
  order.timeline.push({
    key: 'reviewed',
    label: '用户已完成评价',
    at: order.updatedAt,
  });

  const merchant = getMerchant(state, order.merchantId);
  const stats = getReviewStats(state, merchant.id);
  merchant.score = stats.average || merchant.score;

  return clone(review);
}

function listOrdersByUser(state, payload) {
  const user = ensureCurrentUser(state);
  const tab = (payload && payload.tab) || 'all';
  return state.orders
    .filter((item) => item.userId === user.id)
    .filter((item) => statusBelongsToTab(item.status, tab))
    .map((item) => buildOrderSummary(item));
}

function getOrderDetail(state, orderId) {
  const order = getOrder(state, orderId);
  const merchant = getMerchant(state, order.merchantId);
  const review = order.reviewId ? state.reviews.find((item) => item.id === order.reviewId) : null;
  return {
    order: buildOrderSummary(order),
    merchant: clone(merchant),
    review: review ? clone(review) : null,
  };
}

function listCouponsByUser(state) {
  const user = ensureCurrentUser(state);
  return state.coupons.filter((item) => item.userId === user.id).map((item) => ({
    ...clone(item),
    statusLabel: formatOrderStatus(item.status),
  }));
}

function listAddressesByUser(state) {
  const user = ensureCurrentUser(state);
  return state.addresses.filter((item) => item.userId === user.id).map((item) => clone(item));
}

function saveAddress(state, payload) {
  const user = ensureCurrentUser(state);
  const contactName = String(payload.contactName || '').trim();
  const phone = String(payload.phone || '').trim();
  const detail = String(payload.detail || '').trim();
  const tag = String(payload.tag || '').trim() || '其他';

  assert(contactName.length >= 2, 'ADDRESS_NAME_INVALID', '联系人至少 2 个字');
  assert(/^1\d{10}$/.test(phone), 'ADDRESS_PHONE_INVALID', '联系电话格式不正确');
  assert(detail.length >= 6, 'ADDRESS_DETAIL_INVALID', '请填写更完整的收货地址');

  let address = payload.id ? state.addresses.find((item) => item.id === payload.id && item.userId === user.id) : null;
  if (address) {
    address.contactName = contactName;
    address.phone = phone;
    address.detail = detail;
    address.tag = tag;
  } else {
    address = {
      id: allocateId(state, 'address'),
      userId: user.id,
      contactName,
      phone,
      detail,
      tag,
      isDefault: !state.addresses.some((item) => item.userId === user.id),
    };
    state.addresses.unshift(address);
  }

  if (payload.isDefault) {
    state.addresses.forEach((item) => {
      if (item.userId === user.id) {
        item.isDefault = item.id === address.id;
      }
    });
  }

  return clone(address);
}

function deleteAddress(state, payload) {
  const user = ensureCurrentUser(state);
  const address = state.addresses.find((item) => item.id === payload.id && item.userId === user.id);
  assert(address, 'ADDRESS_NOT_FOUND', '地址不存在');
  assert(!address.isDefault, 'ADDRESS_DEFAULT_PROTECTED', '默认地址不能直接删除，请先切换默认地址');
  state.addresses = state.addresses.filter((item) => item.id !== payload.id);
}

function setDefaultAddress(state, payload) {
  const user = ensureCurrentUser(state);
  const address = state.addresses.find((item) => item.id === payload.id && item.userId === user.id);
  assert(address, 'ADDRESS_NOT_FOUND', '地址不存在');
  state.addresses.forEach((item) => {
    if (item.userId === user.id) {
      item.isDefault = item.id === payload.id;
    }
  });
  return clone(address);
}

function merchantApply(state, payload) {
  const user = ensureCurrentUser(state);
  const name = String(payload.name || '').trim();
  const category = String(payload.category || '').trim();
  const intro = String(payload.intro || '').trim();
  const licenseImages = Array.isArray(payload.licenseImages) ? payload.licenseImages.filter(Boolean) : [];

  assert(name.length >= 2, 'MERCHANT_NAME_INVALID', '商家名称至少 2 个字');
  assert(category, 'MERCHANT_CATEGORY_INVALID', '请选择商家分类');
  assert(intro.length >= 6, 'MERCHANT_INTRO_INVALID', '请填写至少 6 个字的商家介绍');
  assert(licenseImages.length > 0, 'MERCHANT_LICENSE_REQUIRED', '请至少上传 1 张资质图片');

  let merchant = user.merchantId ? state.merchants.find((item) => item.id === user.merchantId) : null;
  if (!merchant) {
    merchant = {
      id: allocateId(state, 'merchant'),
      ownerUserId: user.id,
      name,
      category,
      score: 5,
      monthlySales: 0,
      deliveryFee: 4,
      minOrderAmount: 20,
      avgDeliveryTime: '30 分钟',
      distance: '1.0 km',
      notice: '演示模式自动通过审核，可立即进入商家工作台。',
      tags: ['新店入驻'],
      status: MERCHANT_STATUS.APPROVED,
      licenseImages,
      intro,
    };
    state.merchants.unshift(merchant);
    user.merchantId = merchant.id;
    user.role = 'merchant';
  } else {
    merchant.name = name;
    merchant.category = category;
    merchant.intro = intro;
    merchant.licenseImages = licenseImages;
    merchant.status = MERCHANT_STATUS.APPROVED;
  }
  return clone(merchant);
}

function getActorMerchant(state, merchantId) {
  const actor = ensureCurrentUser(state);
  const resolvedMerchantId = merchantId || actor.merchantId;
  assert(resolvedMerchantId, 'MERCHANT_PERMISSION_DENIED', '当前账号还不是商家');
  const merchant = getMerchant(state, resolvedMerchantId);
  assertMerchantOwnership(actor, merchant);
  return merchant;
}

function saveMerchantProduct(state, payload) {
  const merchant = getActorMerchant(state, payload.merchantId);
  const name = String(payload.name || '').trim();
  const description = String(payload.description || '').trim();
  const category = String(payload.category || merchant.category).trim();
  const unit = String(payload.unit || '份').trim();
  const price = Number(payload.price || 0);
  const stock = Number(payload.stock || 0);

  assert(name.length >= 2, 'PRODUCT_NAME_INVALID', '商品名称至少 2 个字');
  assert(description.length >= 4, 'PRODUCT_DESC_INVALID', '商品描述至少 4 个字');
  assert(price > 0, 'PRODUCT_PRICE_INVALID', '商品价格必须大于 0');
  assert(stock >= 0, 'PRODUCT_STOCK_INVALID', '商品库存不能为负数');

  let product = payload.productId ? state.products.find((item) => item.id === payload.productId) : null;
  if (product) {
    assert(product.merchantId === merchant.id, 'MERCHANT_PERMISSION_DENIED', '不能修改其他商家的商品');
    product.name = name;
    product.description = description;
    product.category = category;
    product.price = price;
    product.originPrice = payload.originPrice ? Number(payload.originPrice) : Math.max(price, product.originPrice || price);
    product.stock = stock;
    product.unit = unit;
  } else {
    product = {
      id: allocateId(state, 'product'),
      merchantId: merchant.id,
      category,
      name,
      description,
      price,
      originPrice: payload.originPrice ? Number(payload.originPrice) : Number((price + 3).toFixed(2)),
      stock,
      sales: 0,
      rating: 5,
      unit,
      status: PRODUCT_STATUS.ON_SALE,
      imageUrl: '',
    };
    state.products.unshift(product);
  }
  return clone(product);
}

function toggleMerchantProduct(state, payload) {
  const merchant = getActorMerchant(state, payload.merchantId);
  const product = getProduct(state, payload.productId);
  assert(product.merchantId === merchant.id, 'MERCHANT_PERMISSION_DENIED', '不能操作其他商家的商品');
  product.status = product.status === PRODUCT_STATUS.ON_SALE ? PRODUCT_STATUS.OFF_SALE : PRODUCT_STATUS.ON_SALE;
  return clone(product);
}

function listMerchantProducts(state, payload) {
  const merchant = getActorMerchant(state, payload && payload.merchantId);
  return state.products
    .filter((item) => item.merchantId === merchant.id)
    .map((item) => ({ ...clone(item), statusLabel: formatOrderStatus(item.status) }));
}

function listMerchantOrders(state, payload) {
  const merchant = getActorMerchant(state, payload && payload.merchantId);
  const filter = (payload && payload.filter) || 'all';
  return state.orders
    .filter((item) => item.merchantId === merchant.id)
    .filter((item) => statusBelongsToTab(item.status, filter))
    .map((item) => buildOrderSummary(item));
}

function getMerchantDashboard(state, payload) {
  const merchant = getActorMerchant(state, payload && payload.merchantId);
  const orders = state.orders.filter((item) => item.merchantId === merchant.id);
  const refunds = state.refunds.filter((item) => item.merchantId === merchant.id && item.status === 'completed');
  const grossIncome = orders
    .filter((item) => [ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING, ORDER_STATUS.COMPLETED].includes(item.status))
    .reduce((sum, item) => sum + item.totals.total, 0);
  const completedOrders = orders.filter((item) => item.status === ORDER_STATUS.COMPLETED).length;
  const pendingOrders = orders.filter((item) => item.status === ORDER_STATUS.PENDING_ACCEPT).length;
  const deliveringOrders = orders.filter((item) => [ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING].includes(item.status)).length;
  const refundAmount = refunds.reduce((sum, item) => sum + item.amount, 0);
  const products = getMerchantProducts(state, merchant.id);
  const hotProducts = clone(products)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3);

  return {
    merchant: clone(merchant),
    stats: {
      grossIncome: Number(grossIncome.toFixed(2)),
      completedOrders,
      pendingOrders,
      deliveringOrders,
      refundAmount: Number(refundAmount.toFixed(2)),
      productCount: products.length,
    },
    hotProducts,
    latestOrders: orders.slice(0, 5).map((item) => buildOrderSummary(item)),
  };
}

function getProfile(state) {
  const user = ensureCurrentUser(state);
  const addresses = state.addresses.filter((item) => item.userId === user.id);
  const coupons = state.coupons.filter((item) => item.userId === user.id);
  const orders = state.orders.filter((item) => item.userId === user.id);
  const merchant = user.merchantId ? state.merchants.find((item) => item.id === user.merchantId) : null;
  return {
    user: clone(user),
    summary: {
      balance: user.balance,
      addressCount: addresses.length,
      couponCount: coupons.length,
      orderCount: orders.length,
    },
    merchant: merchant ? clone(merchant) : null,
  };
}

module.exports = {
  ORDER_STATUS,
  appError,
  clone,
  loginWithPhone,
  loginWithWechat,
  logout,
  listHomeMerchants,
  getMerchantDetail,
  updateCartItem,
  setCartRemark,
  clearCart,
  getCartSummary,
  quoteCheckout,
  createOrder,
  payOrder,
  listOrdersByUser,
  getOrderDetail,
  requestRefund,
  processRefund,
  merchantHandleOrder,
  completeOrder,
  submitReview,
  listCouponsByUser,
  listAddressesByUser,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  merchantApply,
  listMerchantProducts,
  saveMerchantProduct,
  toggleMerchantProduct,
  listMerchantOrders,
  getMerchantDashboard,
  getProfile,
  formatOrderStatus,
};
