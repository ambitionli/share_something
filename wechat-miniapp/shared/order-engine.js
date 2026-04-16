const {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_FILTER_GROUPS,
  clone,
  createSeedData
} = require("./seed");

function nowString() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    "-",
    pad(date.getMonth() + 1),
    "-",
    pad(date.getDate()),
    " ",
    pad(date.getHours()),
    ":",
    pad(date.getMinutes()),
    ":",
    pad(date.getSeconds())
  ].join("");
}

function ensureDb(inputDb) {
  const db = inputDb ? clone(inputDb) : createSeedData();
  db.meta = db.meta || { nextIds: {}, nextOrderSequence: 1001, submitTokens: {} };
  db.meta.nextIds = Object.assign(
    {
      user: 1,
      merchant: 1,
      product: 1,
      cart: 1,
      order: 1,
      review: 1,
      address: 1
    },
    db.meta.nextIds || {}
  );
  db.meta.nextOrderSequence = db.meta.nextOrderSequence || 1001;
  db.meta.submitTokens = db.meta.submitTokens || {};
  db.users = db.users || [];
  db.merchants = db.merchants || [];
  db.products = db.products || [];
  db.orders = db.orders || [];
  db.reviews = db.reviews || [];
  db.addresses = db.addresses || [];
  db.carts = db.carts || [];
  db.banners = db.banners || [];
  db.categories = db.categories || [];
  db.customerService = db.customerService || {};
  db.settings = db.settings || {};
  return db;
}

function createId(db, type, prefix) {
  const current = db.meta.nextIds[type] || 1;
  db.meta.nextIds[type] = current + 1;
  return `${prefix}${String(current).padStart(4, "0")}`;
}

function createOrderNo(db) {
  const sequence = db.meta.nextOrderSequence || 1001;
  db.meta.nextOrderSequence = sequence + 1;
  return `LJD${sequence}`;
}

function requireUser(db, userId) {
  const user = db.users.find((item) => item.id === userId);
  if (!user) {
    throw new Error("用户不存在，请重新登录");
  }
  return user;
}

function requireMerchant(db, merchantId) {
  const merchant = db.merchants.find((item) => item.id === merchantId);
  if (!merchant) {
    throw new Error("商家不存在");
  }
  return merchant;
}

function requireProduct(db, productId) {
  const product = db.products.find((item) => item.id === productId);
  if (!product) {
    throw new Error("商品不存在");
  }
  return product;
}

function requireOrder(db, orderId) {
  const order = db.orders.find((item) => item.id === orderId);
  if (!order) {
    throw new Error("订单不存在");
  }
  return order;
}

function getDefaultAddress(db, userId) {
  const addresses = db.addresses.filter((item) => item.userId === userId);
  return addresses.find((item) => item.isDefault) || addresses[0] || null;
}

function appendTimeline(order, label, description) {
  order.timeline = order.timeline || [];
  order.timeline.push({
    at: nowString(),
    label,
    description: description || ""
  });
}

function getOrCreateCart(db, userId, merchantId) {
  let cart = db.carts.find(
    (item) => item.userId === userId && item.merchantId === merchantId
  );
  if (!cart) {
    cart = {
      id: createId(db, "cart", "c"),
      userId,
      merchantId,
      items: []
    };
    db.carts.push(cart);
  }
  return cart;
}

function getCartItemCount(cart) {
  return (cart.items || []).reduce((total, item) => total + item.quantity, 0);
}

function formatOrderStatus(order) {
  return ORDER_STATUS_LABELS[order.status] || order.status;
}

function enrichCart(db, cart) {
  const merchant = requireMerchant(db, cart.merchantId);
  const items = (cart.items || [])
    .map((item) => {
      const product = requireProduct(db, item.productId);
      return {
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        stock: product.stock,
        quantity: item.quantity,
        subtotal: Number((product.price * item.quantity).toFixed(2)),
        onShelf: product.onShelf
      };
    })
    .filter((item) => item.quantity > 0);
  const goodsAmount = items.reduce((total, item) => total + item.subtotal, 0);
  const payableAmount = Number((goodsAmount + merchant.deliveryFee).toFixed(2));

  return {
    id: cart.id,
    merchantId: merchant.id,
    merchantName: merchant.name,
    minOrder: merchant.minOrder,
    deliveryFee: merchant.deliveryFee,
    itemCount: getCartItemCount(cart),
    goodsAmount: Number(goodsAmount.toFixed(2)),
    payableAmount,
    items
  };
}

function enrichOrder(db, order) {
  const merchant = requireMerchant(db, order.merchantId);
  const user = requireUser(db, order.userId);
  return Object.assign({}, clone(order), {
    merchantName: merchant.name,
    merchantCategory: merchant.category,
    userName: user.nickname,
    statusLabel: formatOrderStatus(order)
  });
}

function getHomeData(inputDb, params) {
  const db = ensureDb(inputDb);
  const keyword = (params && params.keyword ? params.keyword : "").trim().toLowerCase();
  const category = params && params.category ? params.category : "";

  const merchants = db.merchants
    .filter((merchant) => merchant.status === "active")
    .filter((merchant) => {
      if (category && merchant.category !== category) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      const merchantMatch = merchant.name.toLowerCase().includes(keyword);
      const productMatch = db.products.some(
        (product) =>
          product.merchantId === merchant.id &&
          product.onShelf &&
          product.name.toLowerCase().includes(keyword)
      );
      return merchantMatch || productMatch;
    })
    .map((merchant) => ({
      id: merchant.id,
      name: merchant.name,
      category: merchant.category,
      rating: merchant.rating,
      sales: merchant.sales,
      minOrder: merchant.minOrder,
      deliveryFee: merchant.deliveryFee,
      avgDeliveryMinutes: merchant.avgDeliveryMinutes,
      description: merchant.description,
      coverImage: merchant.coverImage,
      recommendProducts: db.products
        .filter((product) => product.merchantId === merchant.id && product.onShelf)
        .slice(0, 2)
        .map((product) => product.name)
    }));

  return {
    db,
    banners: clone(db.banners),
    categories: clone(db.categories),
    merchants
  };
}

function getMerchantDetail(inputDb, params) {
  const db = ensureDb(inputDb);
  const merchant = requireMerchant(db, params.merchantId);
  const products = db.products.filter(
    (item) => item.merchantId === merchant.id && item.onShelf
  );
  const cart = params.userId
    ? enrichCart(db, getOrCreateCart(db, params.userId, merchant.id))
    : null;
  const reviews = db.reviews
    .filter((item) => item.merchantId === merchant.id)
    .slice(-3)
    .reverse();

  return {
    db,
    merchant: clone(merchant),
    products: clone(products),
    cart,
    reviews
  };
}

function buildProfile(inputDb, userId) {
  const db = ensureDb(inputDb);
  const user = requireUser(db, userId);
  const merchant =
    user.merchantId && db.merchants.find((item) => item.id === user.merchantId);
  const orderCount = db.orders.filter((item) => item.userId === userId).length;
  const pendingCount = db.orders.filter(
    (item) =>
      item.userId === userId &&
      [
        ORDER_STATUS.PENDING_PAYMENT,
        ORDER_STATUS.PENDING_ACCEPT,
        ORDER_STATUS.ACCEPTED,
        ORDER_STATUS.DELIVERING
      ].includes(item.status)
  ).length;
  const refundCount = db.orders.filter(
    (item) =>
      item.userId === userId &&
      [ORDER_STATUS.REFUND_REQUESTED, ORDER_STATUS.REFUNDED, ORDER_STATUS.REJECTED].includes(
        item.status
      )
  ).length;

  return {
    db,
    user: clone(user),
    merchant: merchant ? clone(merchant) : null,
    addresses: clone(db.addresses.filter((item) => item.userId === userId)),
    summary: {
      orderCount,
      pendingCount,
      refundCount
    },
    customerService: clone(db.customerService),
    settings: clone(db.settings)
  };
}

function loginWithPhone(inputDb, params) {
  const db = ensureDb(inputDb);
  const phone = (params.phone || "").trim();
  const code = (params.code || "").trim();

  if (!/^1\d{10}$/.test(phone)) {
    throw new Error("请输入 11 位手机号");
  }
  if (code !== "123456") {
    throw new Error("演示环境验证码固定为 123456");
  }

  let user = db.users.find((item) => item.phone === phone);
  if (!user) {
    user = {
      id: createId(db, "user", "u"),
      phone,
      nickname: `用户${phone.slice(-4)}`,
      avatarUrl:
        "https://dummyimage.com/120x120/d1c4e9/ffffff&text=U",
      role: "user",
      merchantId: "",
      balance: 100,
      coupons: [],
      createdAt: nowString()
    };
    db.users.push(user);
  }

  return {
    db,
    user: clone(user)
  };
}

function loginWithWechat(inputDb) {
  const db = ensureDb(inputDb);
  const user = {
    id: createId(db, "user", "u"),
    phone: "",
    nickname: `微信用户${String(db.meta.nextIds.user).padStart(4, "0")}`,
    avatarUrl:
      "https://dummyimage.com/120x120/ce93d8/ffffff&text=W",
    role: "user",
    merchantId: "",
    balance: 66,
    coupons: [
      {
        id: `coupon_${Date.now()}`,
        title: "微信授权礼包 6 元",
        amount: 6,
        minSpend: 39,
        expiresAt: "2026-12-31 23:59",
        status: "unused"
      }
    ],
    createdAt: nowString()
  };

  db.users.push(user);

  return {
    db,
    user: clone(user)
  };
}

function listCart(inputDb, userId) {
  const db = ensureDb(inputDb);
  requireUser(db, userId);
  const carts = db.carts
    .filter((item) => item.userId === userId && getCartItemCount(item) > 0)
    .map((item) => enrichCart(db, item));
  const totalCount = carts.reduce((total, item) => total + item.itemCount, 0);
  const totalPayable = carts.reduce((total, item) => total + item.payableAmount, 0);

  return {
    db,
    carts,
    totalCount,
    totalPayable: Number(totalPayable.toFixed(2))
  };
}

function updateCartItem(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, merchantId, productId, delta } = params;
  requireUser(db, userId);
  requireMerchant(db, merchantId);
  const product = requireProduct(db, productId);

  if (product.merchantId !== merchantId) {
    throw new Error("商品与商家不匹配");
  }
  if (!product.onShelf) {
    throw new Error("商品已下架");
  }
  if (!Number.isInteger(delta) || delta === 0) {
    throw new Error("购物车数量变更无效");
  }

  const cart = getOrCreateCart(db, userId, merchantId);
  let item = cart.items.find((entry) => entry.productId === productId);
  if (!item) {
    item = { productId, quantity: 0 };
    cart.items.push(item);
  }

  const nextQuantity = item.quantity + delta;
  if (nextQuantity < 0) {
    throw new Error("购物车数量不能为负数");
  }
  if (nextQuantity > product.stock) {
    throw new Error("库存不足，无法继续加购");
  }

  item.quantity = nextQuantity;
  cart.items = cart.items.filter((entry) => entry.quantity > 0);
  db.carts = db.carts.filter((entry) => getCartItemCount(entry) > 0);

  return {
    db,
    cart: listCart(db, userId).carts.find((entry) => entry.merchantId === merchantId) || {
      merchantId,
      items: [],
      goodsAmount: 0,
      payableAmount: 0,
      itemCount: 0
    }
  };
}

function clearCart(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, merchantId } = params;
  requireUser(db, userId);
  db.carts = db.carts.filter(
    (item) => !(item.userId === userId && item.merchantId === merchantId)
  );
  return { db };
}

function saveAddress(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, address } = params;
  requireUser(db, userId);

  if (!address || !address.name || !address.phone || !address.city || !address.detail) {
    throw new Error("地址信息不完整");
  }
  if (!/^1\d{10}$/.test(address.phone)) {
    throw new Error("收货手机号格式错误");
  }

  if (address.id) {
    const target = db.addresses.find(
      (item) => item.id === address.id && item.userId === userId
    );
    if (!target) {
      throw new Error("地址不存在");
    }
    Object.assign(target, {
      name: address.name,
      phone: address.phone,
      city: address.city,
      detail: address.detail,
      tag: address.tag || "常用",
      isDefault: Boolean(address.isDefault)
    });
    if (target.isDefault) {
      db.addresses.forEach((item) => {
        if (item.userId === userId && item.id !== target.id) {
          item.isDefault = false;
        }
      });
    }
  } else {
    const created = {
      id: createId(db, "address", "a"),
      userId,
      name: address.name,
      phone: address.phone,
      city: address.city,
      detail: address.detail,
      tag: address.tag || "常用",
      isDefault: Boolean(address.isDefault) || db.addresses.every((item) => item.userId !== userId)
    };
    if (created.isDefault) {
      db.addresses.forEach((item) => {
        if (item.userId === userId) {
          item.isDefault = false;
        }
      });
    }
    db.addresses.push(created);
  }

  return {
    db,
    addresses: clone(db.addresses.filter((item) => item.userId === userId))
  };
}

function deleteAddress(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, addressId } = params;
  requireUser(db, userId);
  const address = db.addresses.find(
    (item) => item.id === addressId && item.userId === userId
  );
  if (!address) {
    throw new Error("地址不存在");
  }
  db.addresses = db.addresses.filter((item) => item.id !== addressId);
  const defaultAddress = getDefaultAddress(db, userId);
  if (!defaultAddress) {
    const next = db.addresses.find((item) => item.userId === userId);
    if (next) {
      next.isDefault = true;
    }
  }
  return {
    db,
    addresses: clone(db.addresses.filter((item) => item.userId === userId))
  };
}

function createOrder(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, merchantId, addressId, remark, submitToken } = params;
  requireUser(db, userId);
  const merchant = requireMerchant(db, merchantId);

  if (merchant.status !== "active") {
    throw new Error("商家暂不可下单");
  }

  if (!submitToken) {
    throw new Error("缺少幂等提交令牌");
  }

  const tokenKey = `${userId}:${submitToken}`;
  if (db.meta.submitTokens[tokenKey]) {
    const existingOrder = requireOrder(db, db.meta.submitTokens[tokenKey]);
    return {
      db,
      order: enrichOrder(db, existingOrder),
      idempotent: true
    };
  }

  const cart = db.carts.find(
    (item) => item.userId === userId && item.merchantId === merchantId
  );
  if (!cart || !cart.items.length) {
    throw new Error("购物车为空，请先加购商品");
  }

  const address = db.addresses.find(
    (item) => item.id === addressId && item.userId === userId
  );
  if (!address) {
    throw new Error("请选择有效收货地址");
  }

  const items = cart.items.map((item) => {
    const product = requireProduct(db, item.productId);
    if (!product.onShelf) {
      throw new Error(`${product.name} 已下架`);
    }
    if (item.quantity <= 0) {
      throw new Error("下单商品数量必须大于 0");
    }
    if (product.stock < item.quantity) {
      throw new Error(`${product.name} 库存不足`);
    }
    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
      subtotal: Number((product.price * item.quantity).toFixed(2))
    };
  });

  const goodsAmount = items.reduce((total, item) => total + item.subtotal, 0);
  if (goodsAmount < merchant.minOrder) {
    throw new Error(`还差 ${Number((merchant.minOrder - goodsAmount).toFixed(2))} 元起送`);
  }

  items.forEach((item) => {
    const product = requireProduct(db, item.productId);
    product.stock -= item.quantity;
  });

  const order = {
    id: createId(db, "order", "o"),
    orderNo: createOrderNo(db),
    userId,
    merchantId,
    status: ORDER_STATUS.PENDING_PAYMENT,
    goodsAmount: Number(goodsAmount.toFixed(2)),
    deliveryFee: merchant.deliveryFee,
    payableAmount: Number((goodsAmount + merchant.deliveryFee).toFixed(2)),
    remark: remark || "",
    addressSnapshot: clone(address),
    items,
    reviewed: false,
    merchantAccepted: false,
    paymentId: "",
    createdAt: nowString(),
    refund: null,
    timeline: []
  };

  appendTimeline(order, "订单创建", "系统已锁定库存，等待支付");
  db.orders.unshift(order);
  db.carts = db.carts.filter(
    (item) => !(item.userId === userId && item.merchantId === merchantId)
  );
  db.meta.submitTokens[tokenKey] = order.id;

  return {
    db,
    order: enrichOrder(db, order),
    idempotent: false
  };
}

function payOrder(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, orderId } = params;
  requireUser(db, userId);
  const order = requireOrder(db, orderId);
  if (order.userId !== userId) {
    throw new Error("无权支付此订单");
  }
  if (order.status !== ORDER_STATUS.PENDING_PAYMENT) {
    throw new Error("订单当前不可支付，请勿重复下单");
  }

  order.status = ORDER_STATUS.PENDING_ACCEPT;
  order.paymentId = `PAY${Date.now()}`;
  appendTimeline(order, "支付成功", "模拟支付完成，等待商家接单");

  order.items.forEach((item) => {
    const product = requireProduct(db, item.productId);
    product.monthlySales += item.quantity;
  });
  const merchant = requireMerchant(db, order.merchantId);
  merchant.sales += 1;

  return {
    db,
    order: enrichOrder(db, order)
  };
}

function merchantAcceptOrder(inputDb, params) {
  const db = ensureDb(inputDb);
  const { merchantId, orderId } = params;
  requireMerchant(db, merchantId);
  const order = requireOrder(db, orderId);
  if (order.merchantId !== merchantId) {
    throw new Error("无权处理此订单");
  }
  if (order.status !== ORDER_STATUS.PENDING_ACCEPT) {
    throw new Error("当前订单状态不可接单");
  }
  order.status = ORDER_STATUS.ACCEPTED;
  order.merchantAccepted = true;
  appendTimeline(order, "商家已接单", "正在备货并分配配送");
  return {
    db,
    order: enrichOrder(db, order)
  };
}

function merchantDispatchOrder(inputDb, params) {
  const db = ensureDb(inputDb);
  const { merchantId, orderId } = params;
  requireMerchant(db, merchantId);
  const order = requireOrder(db, orderId);
  if (order.merchantId !== merchantId) {
    throw new Error("无权处理此订单");
  }
  if (order.status !== ORDER_STATUS.ACCEPTED) {
    throw new Error("请先接单后再开始配送");
  }
  order.status = ORDER_STATUS.DELIVERING;
  appendTimeline(order, "开始配送", "骑手已取货，正在赶往收货地址");
  return {
    db,
    order: enrichOrder(db, order)
  };
}

function restoreInventoryIfNeeded(db, order) {
  if (!order || order.inventoryRestored) {
    return;
  }
  order.items.forEach((item) => {
    const product = requireProduct(db, item.productId);
    product.stock += item.quantity;
  });
  order.inventoryRestored = true;
}

function merchantRejectOrder(inputDb, params) {
  const db = ensureDb(inputDb);
  const { merchantId, orderId, reason } = params;
  requireMerchant(db, merchantId);
  const order = requireOrder(db, orderId);
  if (order.merchantId !== merchantId) {
    throw new Error("无权处理此订单");
  }
  if (![ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED].includes(order.status)) {
    throw new Error("当前订单不可拒单");
  }
  restoreInventoryIfNeeded(db, order);
  order.status = ORDER_STATUS.REJECTED;
  order.refund = {
    reason: reason || "商家无法接单",
    status: ORDER_STATUS.REFUNDED,
    amount: order.payableAmount,
    previousStatus: ORDER_STATUS.PENDING_ACCEPT,
    resolvedAt: nowString()
  };
  appendTimeline(order, "商家拒单", reason || "商家已拒绝并自动退款");
  return {
    db,
    order: enrichOrder(db, order)
  };
}

function confirmOrder(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, orderId } = params;
  requireUser(db, userId);
  const order = requireOrder(db, orderId);
  if (order.userId !== userId) {
    throw new Error("无权确认此订单");
  }
  if (order.status !== ORDER_STATUS.DELIVERING) {
    throw new Error("只有配送中的订单才能确认完成");
  }
  order.status = ORDER_STATUS.COMPLETED;
  appendTimeline(order, "订单完成", "用户已确认收货");
  return {
    db,
    order: enrichOrder(db, order)
  };
}

function requestRefund(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, orderId, reason } = params;
  requireUser(db, userId);
  const order = requireOrder(db, orderId);
  if (order.userId !== userId) {
    throw new Error("无权申请此订单退款");
  }
  if (
    ![
      ORDER_STATUS.PENDING_ACCEPT,
      ORDER_STATUS.ACCEPTED,
      ORDER_STATUS.DELIVERING,
      ORDER_STATUS.COMPLETED
    ].includes(order.status)
  ) {
    throw new Error("当前订单暂不支持退款");
  }
  if (order.reviewed) {
    throw new Error("已评价订单暂不支持退款");
  }
  if (order.status === ORDER_STATUS.REFUND_REQUESTED) {
    throw new Error("退款申请已提交，请勿重复操作");
  }

  order.refund = {
    reason: reason || "用户申请退款",
    status: ORDER_STATUS.REFUND_REQUESTED,
    amount: order.payableAmount,
    previousStatus: order.status,
    appliedAt: nowString()
  };
  order.status = ORDER_STATUS.REFUND_REQUESTED;
  appendTimeline(order, "发起退款", order.refund.reason);

  return {
    db,
    order: enrichOrder(db, order)
  };
}

function processRefund(inputDb, params) {
  const db = ensureDb(inputDb);
  const { merchantId, orderId, approve, reason } = params;
  requireMerchant(db, merchantId);
  const order = requireOrder(db, orderId);
  if (order.merchantId !== merchantId) {
    throw new Error("无权处理此退款");
  }
  if (order.status !== ORDER_STATUS.REFUND_REQUESTED || !order.refund) {
    throw new Error("当前订单没有待处理退款");
  }

  if (approve) {
    if (
      [ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED].includes(
        order.refund.previousStatus
      )
    ) {
      restoreInventoryIfNeeded(db, order);
    }
    order.status = ORDER_STATUS.REFUNDED;
    order.refund.status = ORDER_STATUS.REFUNDED;
    order.refund.reason = reason || order.refund.reason;
    order.refund.resolvedAt = nowString();
    appendTimeline(order, "退款完成", order.refund.reason);
  } else {
    order.status = order.refund.previousStatus;
    order.refund.status = "rejected";
    order.refund.reason = reason || "退款申请被驳回";
    order.refund.resolvedAt = nowString();
    appendTimeline(order, "退款驳回", order.refund.reason);
  }

  return {
    db,
    order: enrichOrder(db, order)
  };
}

function submitReview(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, orderId, score, content, images } = params;
  requireUser(db, userId);
  const order = requireOrder(db, orderId);
  if (order.userId !== userId) {
    throw new Error("无权评价此订单");
  }
  if (order.status !== ORDER_STATUS.COMPLETED) {
    throw new Error("订单未完成，暂不能评价");
  }
  if (order.reviewed) {
    throw new Error("订单已评价，请勿重复提交");
  }
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error("评分范围应为 1-5 星");
  }

  const review = {
    id: createId(db, "review", "r"),
    orderId: order.id,
    merchantId: order.merchantId,
    userId,
    score,
    content: (content || "").trim(),
    images: clone(images || []).slice(0, 3),
    createdAt: nowString()
  };

  db.reviews.unshift(review);
  order.reviewed = true;
  appendTimeline(order, "评价完成", `评分 ${score} 星`);

  const merchantReviews = db.reviews.filter(
    (item) => item.merchantId === order.merchantId
  );
  const merchant = requireMerchant(db, order.merchantId);
  merchant.rating = Number(
    (
      merchantReviews.reduce((total, item) => total + item.score, 0) /
      merchantReviews.length
    ).toFixed(1)
  );

  return {
    db,
    review: clone(review),
    order: enrichOrder(db, order)
  };
}

function listOrders(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, statusGroup } = params;
  requireUser(db, userId);
  const statuses = ORDER_FILTER_GROUPS[statusGroup] || [];
  const orders = db.orders
    .filter((item) => item.userId === userId)
    .filter((item) => !statuses.length || statuses.includes(item.status))
    .map((item) => enrichOrder(db, item));
  return {
    db,
    orders
  };
}

function getOrderDetail(inputDb, params) {
  const db = ensureDb(inputDb);
  const order = requireOrder(db, params.orderId);
  if (params.userId && order.userId !== params.userId) {
    throw new Error("无权查看此订单");
  }
  return {
    db,
    order: enrichOrder(db, order)
  };
}

function merchantJoin(inputDb, params) {
  const db = ensureDb(inputDb);
  const { userId, form } = params;
  const user = requireUser(db, userId);

  if (user.merchantId) {
    return {
      db,
      merchant: clone(requireMerchant(db, user.merchantId)),
      alreadyExists: true
    };
  }
  if (!form || !form.name || !form.category || !form.description) {
    throw new Error("请填写完整的入驻信息");
  }

  const merchant = {
    id: createId(db, "merchant", "m"),
    ownerUserId: userId,
    name: form.name,
    category: form.category,
    rating: 5,
    sales: 0,
    minOrder: Number(form.minOrder || 0),
    deliveryFee: Number(form.deliveryFee || 0),
    avgDeliveryMinutes: Number(form.avgDeliveryMinutes || 30),
    description: form.description,
    address: form.address || "待完善",
    notice: form.notice || "欢迎光临",
    qualificationImages: clone(form.qualificationImages || []).slice(0, 3),
    coverImage:
      form.coverImage ||
      "https://dummyimage.com/220x220/b39ddb/ffffff&text=%E6%96%B0%E5%95%86%E5%AE%B6",
    status: "active"
  };

  db.merchants.push(merchant);
  user.role = "merchant";
  user.merchantId = merchant.id;

  return {
    db,
    merchant: clone(merchant),
    alreadyExists: false
  };
}

function upsertProduct(inputDb, params) {
  const db = ensureDb(inputDb);
  const { merchantId, product } = params;
  requireMerchant(db, merchantId);

  if (!product || !product.name) {
    throw new Error("商品名称不能为空");
  }
  if (Number(product.price) <= 0) {
    throw new Error("商品价格必须大于 0");
  }
  if (Number(product.stock) < 0) {
    throw new Error("库存不能为负数");
  }

  if (product.id) {
    const target = db.products.find(
      (item) => item.id === product.id && item.merchantId === merchantId
    );
    if (!target) {
      throw new Error("商品不存在");
    }
    Object.assign(target, {
      name: product.name,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || product.price),
      stock: Number(product.stock),
      onShelf: product.onShelf !== false,
      image:
        product.image ||
        target.image ||
        "https://dummyimage.com/180x180/ffcc80/ffffff&text=%E5%95%86%E5%93%81"
    });
  } else {
    db.products.unshift({
      id: createId(db, "product", "p"),
      merchantId,
      name: product.name,
      price: Number(product.price),
      originalPrice: Number(product.originalPrice || product.price),
      stock: Number(product.stock),
      monthlySales: 0,
      rating: 5,
      onShelf: product.onShelf !== false,
      image:
        product.image ||
        "https://dummyimage.com/180x180/ffcc80/ffffff&text=%E6%96%B0%E5%93%81"
    });
  }

  return {
    db,
    products: clone(db.products.filter((item) => item.merchantId === merchantId))
  };
}

function toggleProductShelf(inputDb, params) {
  const db = ensureDb(inputDb);
  const { merchantId, productId, onShelf } = params;
  const product = db.products.find(
    (item) => item.id === productId && item.merchantId === merchantId
  );
  if (!product) {
    throw new Error("商品不存在");
  }
  product.onShelf = Boolean(onShelf);
  return {
    db,
    product: clone(product)
  };
}

function listMerchantProducts(inputDb, params) {
  const db = ensureDb(inputDb);
  requireMerchant(db, params.merchantId);
  return {
    db,
    products: clone(db.products.filter((item) => item.merchantId === params.merchantId))
  };
}

function listMerchantOrders(inputDb, params) {
  const db = ensureDb(inputDb);
  requireMerchant(db, params.merchantId);
  return {
    db,
    orders: db.orders
      .filter((item) => item.merchantId === params.merchantId)
      .map((item) => enrichOrder(db, item))
  };
}

function getMerchantOverview(inputDb, params) {
  const db = ensureDb(inputDb);
  const merchant = requireMerchant(db, params.merchantId);
  const orders = db.orders
    .filter((item) => item.merchantId === params.merchantId)
    .map((item) => enrichOrder(db, item));
  const products = db.products.filter((item) => item.merchantId === params.merchantId);
  const stats = getMerchantStats(db, { merchantId: params.merchantId }).stats;

  return {
    db,
    merchant: clone(merchant),
    products: clone(products),
    orders: clone(orders),
    stats
  };
}

function getMerchantCenterData(inputDb, params) {
  return getMerchantOverview(inputDb, params);
}

function getMerchantStats(inputDb, params) {
  const db = ensureDb(inputDb);
  requireMerchant(db, params.merchantId);
  const merchantOrders = db.orders.filter((item) => item.merchantId === params.merchantId);
  const paidOrDelivered = merchantOrders.filter((item) =>
    [ORDER_STATUS.ACCEPTED, ORDER_STATUS.DELIVERING, ORDER_STATUS.COMPLETED].includes(
      item.status
    )
  );
  const completed = merchantOrders.filter(
    (item) => item.status === ORDER_STATUS.COMPLETED
  );
  const refunded = merchantOrders.filter((item) =>
    [ORDER_STATUS.REFUNDED, ORDER_STATUS.REJECTED].includes(item.status)
  );

  return {
    db,
    stats: {
      totalOrders: merchantOrders.length,
      activeOrders: merchantOrders.filter((item) =>
        [
          ORDER_STATUS.PENDING_ACCEPT,
          ORDER_STATUS.ACCEPTED,
          ORDER_STATUS.DELIVERING,
          ORDER_STATUS.REFUND_REQUESTED
        ].includes(item.status)
      ).length,
      completedOrders: completed.length,
      salesAmount: Number(
        completed.reduce((total, item) => total + item.payableAmount, 0).toFixed(2)
      ),
      incomeAmount: Number(
        paidOrDelivered.reduce((total, item) => total + item.payableAmount, 0).toFixed(2)
      ),
      refundAmount: Number(
        refunded.reduce((total, item) => total + item.payableAmount, 0).toFixed(2)
      )
    }
  };
}

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_FILTER_GROUPS,
  ensureDb,
  getHomeData,
  getMerchantDetail,
  buildProfile,
  getMerchantCenterData,
  loginWithPhone,
  loginWithWechat,
  listCart,
  updateCartItem,
  clearCart,
  saveAddress,
  deleteAddress,
  createOrder,
  payOrder,
  merchantAcceptOrder,
  merchantDispatchOrder,
  merchantRejectOrder,
  confirmOrder,
  requestRefund,
  processRefund,
  submitReview,
  listOrders,
  getOrderDetail,
  merchantJoin,
  upsertProduct,
  toggleProductShelf,
  listMerchantProducts,
  listMerchantOrders,
  getMerchantStats,
  getMerchantOverview
};
