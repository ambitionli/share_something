const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PENDING_ACCEPT: "pending_accept",
  ACCEPTED: "accepted",
  DELIVERING: "delivering",
  COMPLETED: "completed",
  REFUND_PENDING: "refund_pending",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
  REJECTED: "rejected"
};

const STATUS_LABELS = {
  [ORDER_STATUS.PENDING_PAYMENT]: "待支付",
  [ORDER_STATUS.PENDING_ACCEPT]: "待接单",
  [ORDER_STATUS.ACCEPTED]: "已接单",
  [ORDER_STATUS.DELIVERING]: "配送中",
  [ORDER_STATUS.COMPLETED]: "已完成",
  [ORDER_STATUS.REFUND_PENDING]: "退款处理中",
  [ORDER_STATUS.REFUNDED]: "已退款",
  [ORDER_STATUS.CANCELLED]: "已取消",
  [ORDER_STATUS.REJECTED]: "已拒单"
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function createTimeline(text) {
  return {
    text,
    time: nowIso()
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function roundCurrency(value) {
  return Number(value.toFixed(2));
}

function createSeedState() {
  const state = {
    meta: {
      nextUserId: 5,
      nextOrderId: 1003,
      nextReviewId: 301,
      nextAddressId: 203,
      nextMerchantId: 6,
      nextProductId: 40,
      nextCouponId: 501,
      nextApplicationId: 81
    },
    banners: [
      {
        id: "b1",
        title: "新人大礼包",
        subtitle: "满 30 减 10，今晚也能准时送达",
        image: "https://dummyimage.com/750x260/7f5af0/ffffff&text=LOCAL+SERVICE"
      },
      {
        id: "b2",
        title: "夜间超市",
        subtitle: "零食饮料 30 分钟达",
        image: "https://dummyimage.com/750x260/2cb67d/ffffff&text=NIGHT+SHOP"
      }
    ],
    categories: [
      { id: "food", name: "餐饮", icon: "🍜" },
      { id: "market", name: "超市", icon: "🛒" },
      { id: "medicine", name: "药品", icon: "💊" },
      { id: "fresh", name: "生鲜", icon: "🥬" }
    ],
    users: [
      {
        id: "u1",
        phone: "13800000001",
        nickname: "夜宵猎人",
        avatar: "",
        loginType: "phone",
        balance: 128.5,
        coupons: ["c1", "c2"],
        merchantId: "m1"
      },
      {
        id: "u2",
        phone: "13800000002",
        nickname: "囤货达人",
        avatar: "",
        loginType: "wechat",
        balance: 52,
        coupons: ["c3"],
        merchantId: ""
      },
      {
        id: "u3",
        phone: "13800000003",
        nickname: "药房店主",
        avatar: "",
        loginType: "phone",
        balance: 260,
        coupons: [],
        merchantId: "m3"
      },
      {
        id: "u4",
        phone: "13800000004",
        nickname: "生鲜掌柜",
        avatar: "",
        loginType: "phone",
        balance: 320,
        coupons: [],
        merchantId: "m4"
      }
    ],
    merchants: [
      {
        id: "m1",
        ownerUserId: "u1",
        name: "深夜食堂",
        categoryId: "food",
        announcement: "下单后 35 分钟内送达，夜里也营业。",
        deliveryFee: 4,
        minOrderPrice: 20,
        score: 4.8,
        monthlySales: 1260,
        averageDeliveryMinutes: 32,
        banner: "https://dummyimage.com/750x320/16161a/ffffff&text=Night+Kitchen",
        qualificationImages: [
          "https://dummyimage.com/200x120/94a1b2/ffffff&text=Food+License"
        ],
        address: "海淀区夜色路 66 号",
        tags: ["深夜营业", "招牌炒饭", "可开发票"]
      },
      {
        id: "m2",
        ownerUserId: "",
        name: "小区快超",
        categoryId: "market",
        announcement: "米面粮油日百齐全，单笔满 59 元免配送费。",
        deliveryFee: 3,
        minOrderPrice: 15,
        score: 4.6,
        monthlySales: 880,
        averageDeliveryMinutes: 28,
        banner: "https://dummyimage.com/750x320/0f766e/ffffff&text=Community+Market",
        qualificationImages: [
          "https://dummyimage.com/200x120/0f766e/ffffff&text=Retail+Permit"
        ],
        address: "朝阳区便民街 18 号",
        tags: ["24 小时", "粮油百货", "次日达补货"]
      },
      {
        id: "m3",
        ownerUserId: "u3",
        name: "安康药房",
        categoryId: "medicine",
        announcement: "支持执业药师咨询，夜间常备药不停送。",
        deliveryFee: 5,
        minOrderPrice: 18,
        score: 4.9,
        monthlySales: 430,
        averageDeliveryMinutes: 25,
        banner: "https://dummyimage.com/750x320/2563eb/ffffff&text=Health+Store",
        qualificationImages: [
          "https://dummyimage.com/200x120/2563eb/ffffff&text=Medicine+Permit"
        ],
        address: "丰台区安康大道 10 号",
        tags: ["药师在线", "夜间购药", "急送"]
      },
      {
        id: "m4",
        ownerUserId: "u4",
        name: "鲜到家",
        categoryId: "fresh",
        announcement: "当天采购，产地直送，凌晨下单早市前配送。",
        deliveryFee: 6,
        minOrderPrice: 29,
        score: 4.7,
        monthlySales: 512,
        averageDeliveryMinutes: 40,
        banner: "https://dummyimage.com/750x320/65a30d/ffffff&text=Fresh+Food",
        qualificationImages: [
          "https://dummyimage.com/200x120/65a30d/ffffff&text=Fresh+Supply"
        ],
        address: "通州区鲜仓路 5 号",
        tags: ["产地直采", "当日鲜切", "冷链配送"]
      }
    ],
    products: [
      {
        id: "p1",
        merchantId: "m1",
        name: "招牌牛肉炒饭",
        description: "粒粒分明，夜宵常青款。",
        price: 22,
        stock: 38,
        monthlySales: 410,
        rating: 4.8,
        onShelf: true,
        image: "https://dummyimage.com/240x240/f59e0b/ffffff&text=Rice"
      },
      {
        id: "p2",
        merchantId: "m1",
        name: "酸辣土豆丝",
        description: "脆爽下饭，酸辣开胃。",
        price: 16,
        stock: 25,
        monthlySales: 280,
        rating: 4.7,
        onShelf: true,
        image: "https://dummyimage.com/240x240/ef4444/ffffff&text=Potato"
      },
      {
        id: "p3",
        merchantId: "m1",
        name: "红糖冰粉",
        description: "饭后甜口，清凉解腻。",
        price: 9,
        stock: 30,
        monthlySales: 198,
        rating: 4.9,
        onShelf: true,
        image: "https://dummyimage.com/240x240/f97316/ffffff&text=Sweet"
      },
      {
        id: "p10",
        merchantId: "m2",
        name: "可乐 2L",
        description: "聚会畅饮家庭装。",
        price: 8.5,
        stock: 50,
        monthlySales: 360,
        rating: 4.6,
        onShelf: true,
        image: "https://dummyimage.com/240x240/111827/ffffff&text=Cola"
      },
      {
        id: "p11",
        merchantId: "m2",
        name: "桶装泡面",
        description: "深夜加班应急。",
        price: 6.5,
        stock: 40,
        monthlySales: 530,
        rating: 4.5,
        onShelf: true,
        image: "https://dummyimage.com/240x240/d97706/ffffff&text=Noodles"
      },
      {
        id: "p20",
        merchantId: "m3",
        name: "退热贴 6 片装",
        description: "常备家庭药箱。",
        price: 24,
        stock: 20,
        monthlySales: 120,
        rating: 4.9,
        onShelf: true,
        image: "https://dummyimage.com/240x240/2563eb/ffffff&text=Patch"
      },
      {
        id: "p21",
        merchantId: "m3",
        name: "维生素 C",
        description: "日常营养补充。",
        price: 35,
        stock: 18,
        monthlySales: 95,
        rating: 4.8,
        onShelf: true,
        image: "https://dummyimage.com/240x240/0ea5e9/ffffff&text=VC"
      },
      {
        id: "p30",
        merchantId: "m4",
        name: "精品西红柿",
        description: "脆甜多汁，适合凉拌。",
        price: 12,
        stock: 36,
        monthlySales: 160,
        rating: 4.7,
        onShelf: true,
        image: "https://dummyimage.com/240x240/22c55e/ffffff&text=Tomato"
      },
      {
        id: "p31",
        merchantId: "m4",
        name: "鲜切牛排",
        description: "冷链到家，煎烤皆宜。",
        price: 58,
        stock: 14,
        monthlySales: 88,
        rating: 4.8,
        onShelf: true,
        image: "https://dummyimage.com/240x240/7c2d12/ffffff&text=Steak"
      }
    ],
    addresses: [
      {
        id: "a201",
        userId: "u2",
        name: "李四",
        phone: "13800000002",
        detail: "朝阳区望京 SOHO T2 1208",
        tag: "公司",
        isDefault: true
      },
      {
        id: "a202",
        userId: "u2",
        name: "李四",
        phone: "13800000002",
        detail: "海淀区学院路 66 号 5 单元 302",
        tag: "家",
        isDefault: false
      },
      {
        id: "a203",
        userId: "u1",
        name: "张三",
        phone: "13800000001",
        detail: "中关村软件园 2 期 8 号楼 1802",
        tag: "公司",
        isDefault: true
      },
    ],
    carts: {
      u1: [],
      u2: []
    },
    coupons: [
      { id: "c1", userId: "u1", title: "新人立减", amount: 10, threshold: 30, used: false },
      { id: "c2", userId: "u1", title: "夜宵红包", amount: 6, threshold: 25, used: false },
      { id: "c3", userId: "u2", title: "超市券", amount: 8, threshold: 49, used: false }
    ],
    reviews: [
      {
        id: "r300",
        orderId: "o1001",
        userId: "u2",
        merchantId: "m1",
        rating: 5,
        content: "炒饭分量很足，配送也快。",
        images: [],
        createdAt: "2026-04-10T10:00:00.000Z"
      }
    ],
    orders: [
      {
        id: "o1001",
        orderNo: "LS20260410001",
        userId: "u2",
        merchantId: "m1",
        items: [
          { productId: "p1", name: "招牌牛肉炒饭", price: 22, quantity: 1, image: "https://dummyimage.com/240x240/f59e0b/ffffff&text=Rice" }
        ],
        address: {
          id: "history-a1",
          name: "李四",
          phone: "13800000002",
          detail: "海淀区学院路 1 号",
          tag: "家"
        },
        remark: "少放辣椒",
        deliveryFee: 4,
        packageFee: 2,
        discountAmount: 0,
        totalAmount: 28,
        paymentMethod: "wechat",
        paymentId: "PAY20260410001",
        status: ORDER_STATUS.COMPLETED,
        reviewId: "r300",
        createdAt: "2026-04-10T09:20:00.000Z",
        updatedAt: "2026-04-10T10:00:00.000Z",
        timeline: [
          { text: "订单已创建", time: "2026-04-10T09:20:00.000Z" },
          { text: "支付完成", time: "2026-04-10T09:21:00.000Z" },
          { text: "商家已接单", time: "2026-04-10T09:24:00.000Z" },
          { text: "骑手配送中", time: "2026-04-10T09:35:00.000Z" },
          { text: "订单已完成", time: "2026-04-10T09:58:00.000Z" }
        ],
        riderName: "阿峰",
        courierName: "极速骑手"
      },
      {
        id: "o1002",
        orderNo: "LS20260411002",
        userId: "u2",
        merchantId: "m3",
        items: [
          { productId: "p20", name: "退热贴 6 片装", price: 24, quantity: 1, image: "https://dummyimage.com/240x240/2563eb/ffffff&text=Patch" }
        ],
        address: {
          id: "history-a2",
          name: "李四",
          phone: "13800000002",
          detail: "朝阳区三里屯 8 号",
          tag: "公司"
        },
        remark: "",
        deliveryFee: 5,
        packageFee: 2,
        discountAmount: 0,
        totalAmount: 31,
        paymentMethod: "wechat",
        paymentId: "PAY20260411002",
        status: ORDER_STATUS.REFUNDED,
        reviewId: "",
        createdAt: "2026-04-11T08:00:00.000Z",
        updatedAt: "2026-04-11T08:15:00.000Z",
        timeline: [
          { text: "订单已创建", time: "2026-04-11T08:00:00.000Z" },
          { text: "支付完成", time: "2026-04-11T08:01:00.000Z" },
          { text: "已退款", time: "2026-04-11T08:15:00.000Z" }
        ],
        riderName: "",
        courierName: "",
        refundReason: "商品缺货"
      }
    ],
    merchantApplications: [],
    serviceInfo: {
      supportPhone: "400-800-9527",
      supportWeChat: "local-service-helper"
    },
    settings: {
      notifications: true,
      darkMode: false
    },
    session: {
      currentUserId: "u2"
    }
  };

  return state;
}

function getUser(state, userId) {
  const user = state.users.find((item) => item.id === userId);
  assert(user, "用户不存在");
  return user;
}

function getMerchant(state, merchantId) {
  const merchant = state.merchants.find((item) => item.id === merchantId);
  assert(merchant, "商家不存在");
  return merchant;
}

function getProduct(state, productId) {
  const product = state.products.find((item) => item.id === productId);
  assert(product, "商品不存在");
  return product;
}

function getOrder(state, orderId) {
  const order = state.orders.find((item) => item.id === orderId);
  assert(order, "订单不存在");
  return order;
}

function getCoupon(state, couponId) {
  return state.coupons.find((item) => item.id === couponId);
}

function generateOrderNo(state) {
  const numericId = state.meta.nextOrderId;
  const dateToken = nowIso().slice(0, 10).replace(/-/g, "");
  return `LS${dateToken}${String(numericId).padStart(4, "0")}`;
}

function searchMerchants(state, query) {
  const keyword = (query && query.keyword ? query.keyword : "").trim().toLowerCase();
  const categoryId = query && query.categoryId ? query.categoryId : "";
  return state.merchants
    .filter((merchant) => {
      const categoryMatched = !categoryId || merchant.categoryId === categoryId;
      const keywordMatched =
        !keyword ||
        merchant.name.toLowerCase().includes(keyword) ||
        merchant.tags.some((tag) => tag.toLowerCase().includes(keyword)) ||
        state.products.some(
          (product) =>
            product.merchantId === merchant.id &&
            product.onShelf &&
            product.name.toLowerCase().includes(keyword)
        );
      return categoryMatched && keywordMatched;
    })
    .map((merchant) => {
      const products = state.products.filter((item) => item.merchantId === merchant.id && item.onShelf);
      return {
        ...merchant,
        products: products.slice(0, 3)
      };
    });
}

function getMerchantDetail(state, merchantId) {
  const merchant = getMerchant(state, merchantId);
  const products = state.products.filter((item) => item.merchantId === merchantId);
  const reviews = state.reviews.filter((item) => item.merchantId === merchantId).slice().reverse();
  return {
    merchant,
    products,
    reviews
  };
}

function ensureCart(state, userId) {
  if (!state.carts[userId]) {
    state.carts[userId] = [];
  }
  return state.carts[userId];
}

function getCartSummary(state, userId) {
  const cart = ensureCart(state, userId);
  const items = cart.map((item) => {
    const product = getProduct(state, item.productId);
    const merchant = getMerchant(state, product.merchantId);
    return {
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: item.quantity,
      stock: product.stock,
      merchantId: merchant.id,
      merchantName: merchant.name,
      subtotal: roundCurrency(product.price * item.quantity)
    };
  });

  const merchantId = items.length ? items[0].merchantId : "";
  const merchant = merchantId ? getMerchant(state, merchantId) : null;
  const subtotal = roundCurrency(items.reduce((sum, item) => sum + item.subtotal, 0));
  const deliveryFee = merchant ? merchant.deliveryFee : 0;
  const packageFee = items.length ? 2 : 0;

  return {
    merchantId,
    merchantName: merchant ? merchant.name : "",
    items,
    subtotal,
    deliveryFee,
    packageFee,
    total: roundCurrency(subtotal + deliveryFee + packageFee)
  };
}

function upsertCartItem(state, payload) {
  const { userId, productId } = payload;
  const delta = Number(payload.delta || 0);
  const cart = ensureCart(state, userId);
  const product = getProduct(state, productId);

  assert(product.onShelf, "商品已下架");
  assert(product.stock > 0, "商品库存不足");

  if (cart.length) {
    const firstProduct = getProduct(state, cart[0].productId);
    assert(firstProduct.merchantId === product.merchantId, "购物车仅支持单商家结算");
  }

  const existing = cart.find((item) => item.productId === productId);
  const nextQuantity = (existing ? existing.quantity : 0) + delta;
  assert(nextQuantity >= 0, "购买数量不能为负数");
  assert(nextQuantity <= product.stock, "购买数量超过库存");

  if (existing && nextQuantity === 0) {
    state.carts[userId] = cart.filter((item) => item.productId !== productId);
  } else if (existing) {
    existing.quantity = nextQuantity;
  } else if (nextQuantity > 0) {
    cart.push({ productId, quantity: nextQuantity });
  }

  return getCartSummary(state, userId);
}

function clearCart(state, userId) {
  state.carts[userId] = [];
  return getCartSummary(state, userId);
}

function resolveCouponAmount(state, userId, subtotal, couponId) {
  if (!couponId) {
    return {
      couponId: "",
      discountAmount: 0
    };
  }

  const coupon = getCoupon(state, couponId);
  assert(coupon, "优惠券不存在");
  assert(coupon.userId === userId, "优惠券不属于当前用户");
  assert(!coupon.used, "优惠券已使用");
  assert(subtotal >= coupon.threshold, "未达到优惠券使用门槛");

  return {
    couponId,
    discountAmount: coupon.amount
  };
}

function lockInventory(state, items) {
  items.forEach((item) => {
    const product = getProduct(state, item.productId);
    assert(product.stock >= item.quantity, `商品 ${product.name} 库存不足`);
    product.stock -= item.quantity;
  });
}

function restoreInventory(state, items) {
  items.forEach((item) => {
    const product = getProduct(state, item.productId);
    product.stock += item.quantity;
  });
}

function restoreCouponUsage(state, order) {
  if (!order.couponId) {
    return;
  }

  const coupon = getCoupon(state, order.couponId);
  if (coupon) {
    coupon.used = false;
  }
}

function createOrder(state, payload) {
  const { userId, addressId, remark, couponId } = payload;
  getUser(state, userId);
  const cart = getCartSummary(state, userId);
  assert(cart.items.length > 0, "购物车为空");

  const merchant = getMerchant(state, cart.merchantId);
  assert(cart.subtotal >= merchant.minOrderPrice, `未达到起送价 ${merchant.minOrderPrice} 元`);

  cart.items.forEach((item) => {
    const product = getProduct(state, item.productId);
    assert(product.onShelf, `商品 ${product.name} 已下架`);
    assert(product.stock >= item.quantity, `商品 ${product.name} 库存不足`);
  });

  const address = state.addresses.find((item) => item.id === addressId && item.userId === userId);
  assert(address, "请选择收货地址");

  const couponResult = resolveCouponAmount(state, userId, cart.subtotal, couponId);
  const totalAmount = roundCurrency(
    cart.subtotal + cart.deliveryFee + cart.packageFee - couponResult.discountAmount
  );
  assert(totalAmount >= 0, "订单金额异常");

  lockInventory(state, cart.items);

  const orderId = `o${state.meta.nextOrderId}`;
  const orderNo = generateOrderNo(state);
  state.meta.nextOrderId += 1;

  const order = {
    id: orderId,
    orderNo,
    userId,
    merchantId: merchant.id,
    items: cart.items.map((item) => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    })),
    address: clone(address),
    remark: remark || "",
    deliveryFee: cart.deliveryFee,
    packageFee: cart.packageFee,
    discountAmount: couponResult.discountAmount,
    couponId: couponResult.couponId,
    totalAmount,
    paymentMethod: "wechat",
    paymentId: "",
    status: ORDER_STATUS.PENDING_PAYMENT,
    reviewId: "",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    timeline: [createTimeline("订单已创建，等待支付")],
    riderName: "",
    courierName: ""
  };

  if (couponResult.couponId) {
    const coupon = getCoupon(state, couponResult.couponId);
    coupon.used = true;
  }

  state.orders.unshift(order);
  clearCart(state, userId);

  return clone(order);
}

function payOrder(state, payload) {
  const { userId, orderId } = payload;
  const order = getOrder(state, orderId);
  assert(order.userId === userId, "不能支付他人订单");
  assert(order.status === ORDER_STATUS.PENDING_PAYMENT, "订单状态不允许支付");

  order.status = ORDER_STATUS.PENDING_ACCEPT;
  order.paymentId = `PAY${Date.now()}`;
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("支付完成，等待商家接单"));
  return clone(order);
}

function cancelUnpaidOrder(state, payload) {
  const { userId, orderId } = payload;
  const order = getOrder(state, orderId);
  assert(order.userId === userId, "不能取消他人订单");
  assert(order.status === ORDER_STATUS.PENDING_PAYMENT, "仅待支付订单可取消");

  restoreInventory(state, order.items);
  restoreCouponUsage(state, order);
  order.status = ORDER_STATUS.CANCELLED;
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("订单已取消，库存已恢复"));
  return clone(order);
}

function merchantAcceptOrder(state, payload) {
  const { merchantId, orderId } = payload;
  const order = getOrder(state, orderId);
  assert(order.merchantId === merchantId, "不能处理其他商家订单");
  assert(order.status === ORDER_STATUS.PENDING_ACCEPT, "订单状态不允许接单");

  order.status = ORDER_STATUS.ACCEPTED;
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("商家已接单，正在备货"));
  return clone(order);
}

function merchantRejectOrder(state, payload) {
  const { merchantId, orderId, reason } = payload;
  const order = getOrder(state, orderId);
  assert(order.merchantId === merchantId, "不能处理其他商家订单");
  assert(order.status === ORDER_STATUS.PENDING_ACCEPT, "订单状态不允许拒单");

  restoreInventory(state, order.items);
  restoreCouponUsage(state, order);
  order.status = ORDER_STATUS.REFUNDED;
  order.refundReason = reason || "商家拒单";
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("商家已拒单，金额原路退回"));
  return clone(order);
}

function merchantDeliverOrder(state, payload) {
  const { merchantId, orderId, riderName, courierName } = payload;
  const order = getOrder(state, orderId);
  assert(order.merchantId === merchantId, "不能处理其他商家订单");
  assert(order.status === ORDER_STATUS.ACCEPTED, "仅已接单订单可配送");

  order.status = ORDER_STATUS.DELIVERING;
  order.riderName = riderName || "默认骑手";
  order.courierName = courierName || "同城专送";
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("骑手已取货，订单配送中"));
  return clone(order);
}

function completeOrder(state, payload) {
  const { userId, orderId } = payload;
  const order = getOrder(state, orderId);
  assert(order.userId === userId, "不能确认他人订单");
  assert(order.status === ORDER_STATUS.DELIVERING, "仅配送中的订单可确认完成");

  order.status = ORDER_STATUS.COMPLETED;
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("用户已确认收货"));
  order.items.forEach((item) => {
    const product = getProduct(state, item.productId);
    product.monthlySales += item.quantity;
  });
  const merchant = getMerchant(state, order.merchantId);
  merchant.monthlySales += order.items.reduce((sum, item) => sum + item.quantity, 0);
  return clone(order);
}

function requestRefund(state, payload) {
  const { userId, orderId, reason } = payload;
  const order = getOrder(state, orderId);
  assert(order.userId === userId, "不能操作他人订单");
  assert(
    order.status === ORDER_STATUS.PENDING_ACCEPT || order.status === ORDER_STATUS.ACCEPTED,
    "当前订单状态不支持退款"
  );

  order.status = ORDER_STATUS.REFUND_PENDING;
  order.refundReason = reason || "用户申请退款";
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("用户已发起退款申请"));
  return clone(order);
}

function processRefund(state, payload) {
  const { orderId } = payload;
  const order = getOrder(state, orderId);
  assert(order.status === ORDER_STATUS.REFUND_PENDING, "订单未进入退款流程");

  restoreInventory(state, order.items);
  restoreCouponUsage(state, order);
  order.status = ORDER_STATUS.REFUNDED;
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("退款处理完成"));
  return clone(order);
}

function recalculateMerchantScore(state, merchantId) {
  const merchant = getMerchant(state, merchantId);
  const reviews = state.reviews.filter((item) => item.merchantId === merchantId);
  if (!reviews.length) {
    merchant.score = 5;
    return merchant;
  }

  const average = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  merchant.score = roundCurrency(average);
  return merchant;
}

function submitReview(state, payload) {
  const { userId, orderId, rating, content, images } = payload;
  const order = getOrder(state, orderId);
  assert(order.userId === userId, "不能评价他人订单");
  assert(order.status === ORDER_STATUS.COMPLETED, "仅已完成订单可评价");
  assert(!order.reviewId, "订单已评价");
  assert(rating >= 1 && rating <= 5, "评分应在 1-5 之间");

  const reviewId = `r${state.meta.nextReviewId}`;
  state.meta.nextReviewId += 1;

  const review = {
    id: reviewId,
    orderId,
    userId,
    merchantId: order.merchantId,
    rating,
    content: content || "",
    images: images || [],
    createdAt: nowIso()
  };

  state.reviews.unshift(review);
  order.reviewId = reviewId;
  order.updatedAt = nowIso();
  order.timeline.push(createTimeline("用户已提交评价"));

  recalculateMerchantScore(state, order.merchantId);
  return clone(review);
}

function listOrdersForUser(state, userId, status) {
  getUser(state, userId);
  return clone(
    state.orders.filter((item) => item.userId === userId && (!status || item.status === status))
  );
}

function listOrdersForMerchant(state, merchantId, status) {
  getMerchant(state, merchantId);
  return clone(
    state.orders.filter((item) => item.merchantId === merchantId && (!status || item.status === status))
  );
}

function getOrderDetail(state, userId, orderId) {
  const order = getOrder(state, orderId);
  assert(order.userId === userId || getUser(state, userId).merchantId === order.merchantId, "无权查看该订单");
  return clone(order);
}

function saveAddress(state, payload) {
  const { userId } = payload;
  getUser(state, userId);
  assert(payload.name, "收货人不能为空");
  assert(payload.phone, "手机号不能为空");
  assert(payload.detail, "详细地址不能为空");

  if (payload.id) {
    const existing = state.addresses.find((item) => item.id === payload.id && item.userId === userId);
    assert(existing, "地址不存在");
    existing.name = payload.name;
    existing.phone = payload.phone;
    existing.detail = payload.detail;
    existing.tag = payload.tag || "其他";
    existing.isDefault = Boolean(payload.isDefault);
  } else {
    const addressId = `a${state.meta.nextAddressId}`;
    state.meta.nextAddressId += 1;
    state.addresses.push({
      id: addressId,
      userId,
      name: payload.name,
      phone: payload.phone,
      detail: payload.detail,
      tag: payload.tag || "其他",
      isDefault: Boolean(payload.isDefault)
    });
  }

  if (payload.isDefault) {
    state.addresses.forEach((item) => {
      if (item.userId === userId) {
        item.isDefault = item.id === (payload.id || `a${state.meta.nextAddressId - 1}`);
      }
    });
  }

  return clone(state.addresses.filter((item) => item.userId === userId));
}

function listAddresses(state, userId) {
  getUser(state, userId);
  return clone(state.addresses.filter((item) => item.userId === userId));
}

function loginWithPhone(state, payload) {
  const phone = payload.phone;
  assert(phone, "手机号不能为空");
  let user = state.users.find((item) => item.phone === phone);
  if (!user) {
    user = {
      id: `u${state.meta.nextUserId}`,
      phone,
      nickname: payload.nickname || `用户${phone.slice(-4)}`,
      avatar: "",
      loginType: "phone",
      balance: 0,
      coupons: [],
      merchantId: ""
    };
    state.meta.nextUserId += 1;
    state.users.push(user);
    state.carts[user.id] = [];
  }
  state.session.currentUserId = user.id;
  return clone(user);
}

function loginWithWechat(state, payload) {
  const nickname = payload.nickname || "微信用户";
  const openPhone = payload.phone || `13${Date.now().toString().slice(-9)}`;
  return loginWithPhone(state, {
    phone: openPhone,
    nickname
  });
}

function createMerchantApplication(state, payload) {
  const { userId, name, categoryId, announcement, qualificationImages } = payload;
  const user = getUser(state, userId);
  assert(name, "商家名称不能为空");
  assert(categoryId, "请选择商家分类");

  let merchantId = user.merchantId;
  let merchant;
  if (!merchantId) {
    merchantId = `m${state.meta.nextMerchantId}`;
    state.meta.nextMerchantId += 1;
    merchant = {
      id: merchantId,
      ownerUserId: userId,
      name,
      categoryId,
      announcement: announcement || "欢迎光临",
      deliveryFee: 4,
      minOrderPrice: 20,
      score: 5,
      monthlySales: 0,
      averageDeliveryMinutes: 35,
      banner: "https://dummyimage.com/750x320/475569/ffffff&text=New+Merchant",
      qualificationImages: qualificationImages || [],
      address: "待补充营业地址",
      tags: ["新店入驻", "可开发票"]
    };
    state.merchants.push(merchant);
    user.merchantId = merchantId;
  } else {
    merchant = getMerchant(state, merchantId);
    merchant.name = name;
    merchant.categoryId = categoryId;
    merchant.announcement = announcement || merchant.announcement;
    merchant.qualificationImages = qualificationImages || merchant.qualificationImages;
  }

  const application = {
    id: `ma${state.meta.nextApplicationId}`,
    userId,
    merchantId,
    status: "approved",
    createdAt: nowIso(),
    qualificationImages: qualificationImages || [],
    businessName: name
  };
  state.meta.nextApplicationId += 1;
  state.merchantApplications.unshift(application);

  return clone({
    application,
    merchant
  });
}

function validateProductPayload(payload) {
  assert(payload.name, "商品名称不能为空");
  assert(Number(payload.price) >= 0, "商品价格不能为负数");
  assert(Number(payload.stock) >= 0, "商品库存不能为负数");
}

function upsertMerchantProduct(state, payload) {
  const { merchantId } = payload;
  getMerchant(state, merchantId);
  validateProductPayload(payload);

  if (payload.id) {
    const existing = state.products.find((item) => item.id === payload.id && item.merchantId === merchantId);
    assert(existing, "商品不存在");
    existing.name = payload.name;
    existing.description = payload.description || "";
    existing.price = Number(payload.price);
    existing.stock = Number(payload.stock);
    existing.image = payload.image || existing.image;
    existing.onShelf = payload.onShelf !== undefined ? Boolean(payload.onShelf) : existing.onShelf;
    return clone(existing);
  }

  const product = {
    id: `p${state.meta.nextProductId}`,
    merchantId,
    name: payload.name,
    description: payload.description || "",
    price: Number(payload.price),
    stock: Number(payload.stock),
    monthlySales: 0,
    rating: 5,
    onShelf: payload.onShelf !== undefined ? Boolean(payload.onShelf) : true,
    image: payload.image || "https://dummyimage.com/240x240/64748b/ffffff&text=New+Item"
  };
  state.meta.nextProductId += 1;
  state.products.unshift(product);
  return clone(product);
}

function toggleProductShelf(state, payload) {
  const { merchantId, productId } = payload;
  const product = state.products.find((item) => item.id === productId && item.merchantId === merchantId);
  assert(product, "商品不存在");
  product.onShelf = Boolean(payload.onShelf);
  return clone(product);
}

function getMerchantDashboard(state, merchantId) {
  const merchant = getMerchant(state, merchantId);
  const orders = state.orders.filter((item) => item.merchantId === merchantId);
  const completedOrders = orders.filter((item) => item.status === ORDER_STATUS.COMPLETED);
  const refundedOrders = orders.filter((item) => item.status === ORDER_STATUS.REFUNDED);

  const income = roundCurrency(
    completedOrders.reduce((sum, item) => sum + item.totalAmount, 0)
  );
  const refunds = roundCurrency(
    refundedOrders.reduce((sum, item) => sum + item.totalAmount, 0)
  );

  return clone({
    merchant,
    overview: {
      orderCount: orders.length,
      completedCount: completedOrders.length,
      refundCount: refundedOrders.length,
      income,
      refunds,
      activeProducts: state.products.filter((item) => item.merchantId === merchantId && item.onShelf).length
    },
    orders,
    products: state.products.filter((item) => item.merchantId === merchantId)
  });
}

function getProfile(state, userId) {
  const user = getUser(state, userId);
  return clone({
    user,
    addresses: state.addresses.filter((item) => item.userId === userId),
    coupons: state.coupons.filter((item) => item.userId === userId),
    support: state.serviceInfo,
    settings: state.settings,
    merchant: user.merchantId ? getMerchant(state, user.merchantId) : null
  });
}

function updateSettings(state, payload) {
  if (payload.notifications !== undefined) {
    state.settings.notifications = Boolean(payload.notifications);
  }
  if (payload.darkMode !== undefined) {
    state.settings.darkMode = Boolean(payload.darkMode);
  }

  return clone(state.settings);
}

function getHomeData(state, query) {
  return clone({
    banners: state.banners,
    categories: state.categories,
    merchants: searchMerchants(state, query || {})
  });
}

module.exports = {
  ORDER_STATUS,
  STATUS_LABELS,
  clone,
  createSeedState,
  getHomeData,
  getMerchantDetail,
  getCartSummary,
  upsertCartItem,
  clearCart,
  createOrder,
  payOrder,
  cancelUnpaidOrder,
  merchantAcceptOrder,
  merchantRejectOrder,
  merchantDeliverOrder,
  completeOrder,
  requestRefund,
  processRefund,
  submitReview,
  listOrdersForUser,
  listOrdersForMerchant,
  getOrderDetail,
  saveAddress,
  listAddresses,
  loginWithPhone,
  loginWithWechat,
  createMerchantApplication,
  upsertMerchantProduct,
  toggleProductShelf,
  getMerchantDashboard,
  getProfile,
  updateSettings
};
