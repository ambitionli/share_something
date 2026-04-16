const db = require('../store/database');
const money = require('../utils/money');
const guards = require('../utils/guards');

const STATUS_TEXT = {
  pending_payment: '待支付',
  pending_accept: '待接单',
  delivering: '配送中',
  completed: '已完成',
  refunded: '已退款',
  rejected: '已拒单'
};

const REFUND_TEXT = {
  none: '未退款',
  requested: '退款待处理',
  approved: '退款通过',
  rejected: '退款被拒绝'
};

function clone(value) {
  return db.deepClone(value);
}

function generateId(prefix) {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function now() {
  return new Date().toISOString();
}

function getState() {
  return db.getState();
}

function getCurrentUserFromState(state) {
  if (!state.currentUserId) {
    return null;
  }
  return state.users.find(function (item) {
    return item.id === state.currentUserId;
  }) || null;
}

function requireCurrentUser(state) {
  const user = getCurrentUserFromState(state);
  guards.invariant(user, '请先登录');
  return user;
}

function getMerchantById(state, merchantId) {
  return state.merchants.find(function (item) {
    return item.id === merchantId;
  }) || null;
}

function getProductById(state, productId) {
  return state.products.find(function (item) {
    return item.id === productId;
  }) || null;
}

function getCurrentMerchantFromState(state) {
  const user = requireCurrentUser(state);
  guards.invariant(user.role === 'merchant', '当前账号不是商家身份');
  const merchant = state.merchants.find(function (item) {
    return item.ownerUserId === user.id;
  }) || null;
  guards.invariant(merchant, '当前账号尚未绑定店铺');
  return merchant;
}

function getUserCartItems(state, userId) {
  return state.cartItems.filter(function (item) {
    return item.userId === userId;
  });
}

function buildCartSummary(state, userId, merchantId) {
  const cartItems = getUserCartItems(state, userId);
  const activeMerchantId = merchantId || (cartItems[0] && cartItems[0].merchantId) || '';
  const merchant = activeMerchantId ? getMerchantById(state, activeMerchantId) : null;
  const items = cartItems.filter(function (item) {
    return !activeMerchantId || item.merchantId === activeMerchantId;
  }).map(function (item) {
    const product = getProductById(state, item.productId);
    return {
      productId: item.productId,
      merchantId: item.merchantId,
      quantity: item.quantity,
      name: product ? product.name : '已失效商品',
      price: product ? product.price : 0,
      stock: product ? product.stock : 0,
      amount: money.roundMoney((product ? product.price : 0) * item.quantity)
    };
  });
  const subtotalAmount = money.sumBy(items, function (item) {
    return item.amount;
  });
  const deliveryFee = merchant ? money.roundMoney(merchant.deliveryFee) : 0;
  return {
    merchantId: activeMerchantId,
    merchantName: merchant ? merchant.name : '',
    totalCount: items.reduce(function (total, item) {
      return total + item.quantity;
    }, 0),
    items: items,
    subtotalAmount: subtotalAmount,
    deliveryFee: deliveryFee,
    totalAmount: money.roundMoney(subtotalAmount + deliveryFee),
    minOrderAmount: merchant ? merchant.minOrderAmount : 0,
    meetsMinOrder: merchant ? subtotalAmount >= merchant.minOrderAmount : false
  };
}

function orderMatchesStatus(order, status) {
  if (status === 'all' || !status) {
    return true;
  }
  if (status === 'refund_requested') {
    return order.refundStatus === 'requested';
  }
  return order.status === status;
}

function formatOrder(state, order) {
  const merchant = getMerchantById(state, order.merchantId);
  return {
    id: order.id,
    orderNo: order.orderNo,
    merchantId: order.merchantId,
    merchantName: merchant ? merchant.name : '未知商家',
    items: clone(order.items),
    itemSummary: order.items.map(function (item) {
      return item.name + ' x' + item.quantity;
    }).join(' / '),
    status: order.status,
    statusText: STATUS_TEXT[order.status] || order.status,
    statusClass: 'status-' + order.status,
    refundStatus: order.refundStatus,
    refundText: REFUND_TEXT[order.refundStatus] || order.refundStatus,
    subtotalAmount: order.subtotalAmount,
    deliveryFee: order.deliveryFee,
    totalAmount: order.totalAmount,
    remark: order.remark,
    addressSnapshot: clone(order.addressSnapshot),
    paymentStatus: order.paymentStatus,
    paymentId: order.paymentId || '',
    riderName: order.riderName || '',
    acceptedAt: order.acceptedAt || '',
    paidAt: order.paidAt || '',
    deliveringAt: order.deliveringAt || '',
    completedAt: order.completedAt || '',
    refundReason: order.refundReason || '',
    merchantReply: order.merchantReply || '',
    reviewId: order.reviewId || '',
    createdAt: order.createdAt,
    canPay: order.status === 'pending_payment',
    canRefund: (order.status === 'pending_accept' || order.status === 'delivering') && order.refundStatus === 'none',
    canConfirm: order.status === 'delivering' && order.refundStatus !== 'approved',
    canReview: order.status === 'completed' && !order.reviewId,
    canAccept: order.status === 'pending_accept' && !order.acceptedAt,
    canReject: order.status === 'pending_accept',
    canDeliver: order.status === 'pending_accept' && !!order.acceptedAt && order.refundStatus === 'none',
    canApproveRefund: order.refundStatus === 'requested'
  };
}

function formatMerchant(state, merchant) {
  return {
    id: merchant.id,
    name: merchant.name,
    category: merchant.category,
    rating: merchant.rating,
    deliveryFee: merchant.deliveryFee,
    minOrderAmount: merchant.minOrderAmount,
    sales: merchant.sales,
    status: merchant.status,
    notice: merchant.notice,
    qualificationImages: clone(merchant.qualificationImages),
    monthlyIncome: merchant.monthlyIncome
  };
}

function formatProduct(state, product, userId) {
  const cartItems = getUserCartItems(state, userId);
  const cartItem = cartItems.find(function (item) {
    return item.productId === product.id;
  });
  return {
    id: product.id,
    merchantId: product.merchantId,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    soldCount: product.soldCount,
    status: product.status,
    unit: product.unit,
    inCart: cartItem ? cartItem.quantity : 0
  };
}

function getHomeView(filters) {
  const state = getState();
  const user = requireCurrentUser(state);
  const keyword = String((filters && filters.keyword) || '').trim().toLowerCase();
  const category = (filters && filters.category) || '全部';
  const merchants = state.merchants.filter(function (merchant) {
    const categoryMatched = category === '全部' || merchant.category === category;
    const keywordMatched = !keyword || merchant.name.toLowerCase().indexOf(keyword) >= 0 || merchant.notice.toLowerCase().indexOf(keyword) >= 0;
    return merchant.status === 'active' && categoryMatched && keywordMatched;
  }).map(function (merchant) {
    return formatMerchant(state, merchant);
  });
  return {
    currentUser: clone(user),
    banners: clone(state.banners),
    categories: clone(state.categories),
    activeCategory: category,
    keyword: keyword,
    merchants: merchants,
    cartSummary: buildCartSummary(state, user.id, '')
  };
}

function getMerchantView(merchantId) {
  const state = getState();
  const user = requireCurrentUser(state);
  const merchant = getMerchantById(state, merchantId);
  guards.invariant(merchant, '商家不存在');
  const products = state.products.filter(function (item) {
    return item.merchantId === merchantId && item.status === 'on';
  }).map(function (item) {
    return formatProduct(state, item, user.id);
  });
  return {
    merchant: formatMerchant(state, merchant),
    products: products,
    cartSummary: buildCartSummary(state, user.id, merchantId)
  };
}

function ensureSingleMerchantCart(state, userId, merchantId) {
  const cartItems = getUserCartItems(state, userId);
  const foreignItem = cartItems.find(function (item) {
    return item.merchantId !== merchantId;
  });
  guards.invariant(!foreignItem, '当前购物车已有其他商家的商品，请先结算或清空');
}

function setCartQuantity(input) {
  let nextSummary = null;
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const product = getProductById(draft, input.productId);
    guards.invariant(product, '商品不存在');
    guards.invariant(product.status === 'on', '商品已下架');
    guards.invariant(product.merchantId === input.merchantId, '商品和商家不匹配');
    guards.ensureNonNegativeInt(input.quantity, '商品数量');
    guards.invariant(Number(input.quantity) <= product.stock, '库存不足');
    ensureSingleMerchantCart(draft, user.id, input.merchantId);
    const existing = draft.cartItems.find(function (item) {
      return item.userId === user.id && item.productId === input.productId;
    });
    if (Number(input.quantity) === 0) {
      draft.cartItems = draft.cartItems.filter(function (item) {
        return !(item.userId === user.id && item.productId === input.productId);
      });
    } else if (existing) {
      existing.quantity = Number(input.quantity);
    } else {
      draft.cartItems.push({
        id: generateId('cart'),
        userId: user.id,
        merchantId: input.merchantId,
        productId: input.productId,
        quantity: Number(input.quantity)
      });
    }
    nextSummary = buildCartSummary(draft, user.id, input.merchantId);
  });
  return nextSummary;
}

function clearCart(merchantId) {
  let nextSummary = null;
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    draft.cartItems = draft.cartItems.filter(function (item) {
      return !(item.userId === user.id && (!merchantId || item.merchantId === merchantId));
    });
    nextSummary = buildCartSummary(draft, user.id, merchantId || '');
  });
  return nextSummary;
}

function getCartView(merchantId) {
  const state = getState();
  const user = requireCurrentUser(state);
  return buildCartSummary(state, user.id, merchantId || '');
}

function listAddresses() {
  const state = getState();
  const user = requireCurrentUser(state);
  return state.addresses.filter(function (item) {
    return item.userId === user.id;
  }).sort(function (left, right) {
    return Number(right.isDefault) - Number(left.isDefault);
  }).map(function (item) {
    return clone(item);
  });
}

function saveAddress(payload) {
  guards.ensureNonEmptyString(payload.contactName, '联系人');
  guards.ensurePhone(payload.phone);
  guards.ensureNonEmptyString(payload.detail, '地址');
  let nextList = [];
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    if (payload.isDefault) {
      draft.addresses.forEach(function (item) {
        if (item.userId === user.id) {
          item.isDefault = false;
        }
      });
    }
    if (payload.id) {
      const existing = draft.addresses.find(function (item) {
        return item.id === payload.id && item.userId === user.id;
      });
      guards.invariant(existing, '地址不存在');
      existing.contactName = String(payload.contactName).trim();
      existing.phone = String(payload.phone).trim();
      existing.detail = String(payload.detail).trim();
      existing.tag = String(payload.tag || '其他').trim();
      existing.isDefault = !!payload.isDefault;
    } else {
      draft.addresses.unshift({
        id: generateId('address'),
        userId: user.id,
        contactName: String(payload.contactName).trim(),
        phone: String(payload.phone).trim(),
        detail: String(payload.detail).trim(),
        tag: String(payload.tag || '其他').trim(),
        isDefault: !!payload.isDefault || !draft.addresses.some(function (item) {
          return item.userId === user.id;
        })
      });
    }
    nextList = draft.addresses.filter(function (item) {
      return item.userId === user.id;
    }).sort(function (left, right) {
      return Number(right.isDefault) - Number(left.isDefault);
    }).map(function (item) {
      return clone(item);
    });
  });
  return nextList;
}

function getCheckoutView(merchantId) {
  const state = getState();
  const user = requireCurrentUser(state);
  const cartSummary = buildCartSummary(state, user.id, merchantId || '');
  const addresses = listAddresses();
  return {
    cartSummary: cartSummary,
    addresses: addresses,
    selectedAddressId: (addresses[0] && addresses[0].id) || ''
  };
}

function buildOrderFingerprint(orderItems, merchantId, totalAmount) {
  return merchantId + '|' + orderItems.map(function (item) {
    return item.productId + ':' + item.quantity;
  }).sort().join(',') + '|' + totalAmount;
}

function restoreStock(draft, order) {
  order.items.forEach(function (item) {
    const product = getProductById(draft, item.productId);
    if (product) {
      product.stock += item.quantity;
    }
  });
}

function createOrder(payload) {
  let createdOrderId = '';
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const cartSummary = buildCartSummary(draft, user.id, payload.merchantId);
    guards.invariant(cartSummary.items.length > 0, '购物车为空');
    guards.invariant(cartSummary.meetsMinOrder, '未达到起送价');
    const address = draft.addresses.find(function (item) {
      return item.id === payload.addressId && item.userId === user.id;
    });
    guards.invariant(address, '请选择可用地址');
    const fingerprint = buildOrderFingerprint(cartSummary.items, payload.merchantId, cartSummary.totalAmount);
    const duplicated = draft.orders.find(function (item) {
      return item.userId === user.id && item.cartFingerprint === fingerprint && ['pending_payment', 'pending_accept', 'delivering'].indexOf(item.status) >= 0;
    });
    guards.invariant(!duplicated, '请勿重复下单');
    cartSummary.items.forEach(function (item) {
      const product = getProductById(draft, item.productId);
      guards.invariant(product && product.stock >= item.quantity, product ? product.name + '库存不足' : '商品不存在');
    });
    cartSummary.items.forEach(function (item) {
      const product = getProductById(draft, item.productId);
      product.stock -= item.quantity;
    });
    createdOrderId = generateId('order');
    draft.orders.unshift({
      id: createdOrderId,
      orderNo: 'NL' + Date.now(),
      userId: user.id,
      merchantId: payload.merchantId,
      items: cartSummary.items.map(function (item) {
        return { productId: item.productId, name: item.name, price: item.price, quantity: item.quantity };
      }),
      subtotalAmount: cartSummary.subtotalAmount,
      deliveryFee: cartSummary.deliveryFee,
      totalAmount: cartSummary.totalAmount,
      addressSnapshot: clone(address),
      remark: String(payload.remark || '').trim(),
      status: 'pending_payment',
      paymentStatus: 'unpaid',
      refundStatus: 'none',
      cartFingerprint: fingerprint,
      paymentId: '',
      riderName: '',
      merchantReply: '',
      reviewId: '',
      createdAt: now()
    });
    draft.cartItems = draft.cartItems.filter(function (item) {
      return !(item.userId === user.id && item.merchantId === payload.merchantId);
    });
  });
  return getOrderDetail(createdOrderId);
}

function getOrderDetail(orderId) {
  const state = getState();
  const order = state.orders.find(function (item) {
    return item.id === orderId;
  });
  guards.invariant(order, '订单不存在');
  const user = requireCurrentUser(state);
  const merchant = state.merchants.find(function (item) {
    return item.ownerUserId === user.id;
  }) || null;
  const visible = order.userId === user.id || (merchant && merchant.id === order.merchantId);
  guards.invariant(visible, '无权查看该订单');
  return formatOrder(state, order);
}

function payOrder(orderId) {
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.userId === user.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'pending_payment', '当前订单不可支付');
    order.status = 'pending_accept';
    order.paymentStatus = 'paid';
    order.paymentId = 'PAY_' + Date.now();
    order.paidAt = now();
  });
  return getOrderDetail(orderId);
}

function cancelOrder(orderId) {
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.userId === user.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'pending_payment', '仅待支付订单可取消');
    order.status = 'refunded';
    order.paymentStatus = 'cancelled';
    order.refundStatus = 'approved';
    order.merchantReply = '用户主动取消';
    restoreStock(draft, order);
  });
  return getOrderDetail(orderId);
}

function requestRefund(orderId, reason) {
  guards.ensureNonEmptyString(reason, '退款原因');
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.userId === user.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'pending_accept' || order.status === 'delivering', '当前状态不可申请退款');
    guards.invariant(order.refundStatus === 'none', '退款已发起，请勿重复提交');
    order.refundStatus = 'requested';
    order.refundReason = String(reason).trim();
  });
  return getOrderDetail(orderId);
}

function acceptOrder(orderId) {
  db.updateState(function (draft) {
    const merchant = getCurrentMerchantFromState(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.merchantId === merchant.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'pending_accept', '当前状态不可接单');
    order.acceptedAt = now();
    order.merchantReply = '商家已接单，正在备货';
  });
  return getOrderDetail(orderId);
}

function rejectOrder(orderId, reason) {
  db.updateState(function (draft) {
    const merchant = getCurrentMerchantFromState(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.merchantId === merchant.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'pending_accept', '当前状态不可拒单');
    order.status = 'refunded';
    order.refundStatus = 'approved';
    order.paymentStatus = 'refunded';
    order.merchantReply = String(reason || '商家拒单，已原路退款').trim();
    restoreStock(draft, order);
  });
  return getOrderDetail(orderId);
}

function markDelivering(orderId, riderName) {
  db.updateState(function (draft) {
    const merchant = getCurrentMerchantFromState(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.merchantId === merchant.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'pending_accept', '当前状态不可发起配送');
    guards.invariant(order.acceptedAt, '请先接单再发配送');
    guards.invariant(order.refundStatus === 'none', '退款处理中，暂不可配送');
    order.status = 'delivering';
    order.deliveringAt = now();
    order.riderName = String(riderName || '系统骑手').trim();
    order.merchantReply = '骑手 ' + order.riderName + ' 已接单配送';
  });
  return getOrderDetail(orderId);
}

function confirmOrder(orderId) {
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.userId === user.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'delivering', '仅配送中订单可确认完成');
    guards.invariant(order.refundStatus !== 'approved', '退款订单不可确认完成');
    order.status = 'completed';
    order.completedAt = now();
    order.merchantReply = '订单已完成，期待您的评价';
    order.items.forEach(function (item) {
      const product = getProductById(draft, item.productId);
      if (product) {
        product.soldCount += item.quantity;
      }
    });
    const merchant = getMerchantById(draft, order.merchantId);
    if (merchant) {
      merchant.sales += 1;
      merchant.monthlyIncome = money.roundMoney(merchant.monthlyIncome + order.totalAmount);
    }
  });
  return getOrderDetail(orderId);
}

function handleRefund(orderId, approve, note) {
  db.updateState(function (draft) {
    const merchant = getCurrentMerchantFromState(draft);
    const order = draft.orders.find(function (item) {
      return item.id === orderId && item.merchantId === merchant.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.refundStatus === 'requested', '当前订单没有待处理退款');
    if (approve) {
      order.status = 'refunded';
      order.refundStatus = 'approved';
      order.paymentStatus = 'refunded';
      order.merchantReply = String(note || '商家已同意退款').trim();
      restoreStock(draft, order);
    } else {
      order.refundStatus = 'rejected';
      order.merchantReply = String(note || '商家暂不同意退款').trim();
    }
  });
  return getOrderDetail(orderId);
}

function submitReview(payload) {
  guards.invariant(Number(payload.rating) >= 1 && Number(payload.rating) <= 5, '评分必须在1到5之间');
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    const order = draft.orders.find(function (item) {
      return item.id === payload.orderId && item.userId === user.id;
    });
    guards.invariant(order, '订单不存在');
    guards.invariant(order.status === 'completed', '已完成订单才可评价');
    guards.invariant(!order.reviewId, '订单已评价');
    const reviewId = generateId('review');
    order.reviewId = reviewId;
    draft.reviews.unshift({
      id: reviewId,
      orderId: order.id,
      merchantId: order.merchantId,
      userId: user.id,
      rating: Number(payload.rating),
      content: String(payload.content || '').trim(),
      images: clone(payload.images || []),
      createdAt: now()
    });
    const merchantReviews = draft.reviews.filter(function (item) {
      return item.merchantId === order.merchantId;
    });
    const merchant = getMerchantById(draft, order.merchantId);
    if (merchant) {
      merchant.rating = Math.round((merchantReviews.reduce(function (total, item) {
        return total + item.rating;
      }, 0) / merchantReviews.length) * 10) / 10;
    }
  });
  return getOrderDetail(payload.orderId);
}

function getUserOrders(status) {
  const state = getState();
  const user = requireCurrentUser(state);
  return state.orders.filter(function (item) {
    return item.userId === user.id && orderMatchesStatus(item, status);
  }).map(function (item) {
    return formatOrder(state, item);
  });
}

function getMerchantOrders(status) {
  const state = getState();
  const merchant = getCurrentMerchantFromState(state);
  return state.orders.filter(function (item) {
    return item.merchantId === merchant.id && orderMatchesStatus(item, status);
  }).map(function (item) {
    return formatOrder(state, item);
  });
}

function computeMerchantStats(state, merchantId) {
  const merchantOrders = state.orders.filter(function (item) {
    return item.merchantId === merchantId;
  });
  return {
    totalOrders: merchantOrders.length,
    waitingOrders: merchantOrders.filter(function (item) {
      return item.status === 'pending_accept';
    }).length,
    deliveringOrders: merchantOrders.filter(function (item) {
      return item.status === 'delivering';
    }).length,
    refundOrders: merchantOrders.filter(function (item) {
      return item.status === 'refunded' || item.refundStatus === 'requested';
    }).length,
    revenue: money.sumBy(merchantOrders.filter(function (item) {
      return item.status === 'completed';
    }), function (item) {
      return item.totalAmount;
    }),
    refundedAmount: money.sumBy(merchantOrders.filter(function (item) {
      return item.status === 'refunded';
    }), function (item) {
      return item.totalAmount;
    })
  };
}

function getMerchantDashboardView() {
  const state = getState();
  const merchant = getCurrentMerchantFromState(state);
  const products = state.products.filter(function (item) {
    return item.merchantId === merchant.id;
  }).map(function (item) {
    return formatProduct(state, item, merchant.ownerUserId);
  });
  return {
    merchant: formatMerchant(state, merchant),
    stats: computeMerchantStats(state, merchant.id),
    products: products,
    recentOrders: getMerchantOrders('all').slice(0, 5)
  };
}

function getMerchantProductsView() {
  const state = getState();
  const merchant = getCurrentMerchantFromState(state);
  return {
    merchant: formatMerchant(state, merchant),
    products: state.products.filter(function (item) {
      return item.merchantId === merchant.id;
    }).map(function (item) {
      return formatProduct(state, item, merchant.ownerUserId);
    })
  };
}

function saveProduct(payload) {
  guards.ensureNonEmptyString(payload.name, '商品名称');
  guards.ensurePositiveMoney(Number(payload.price), '商品价格');
  guards.ensureNonNegativeInt(Number(payload.stock), '库存');
  db.updateState(function (draft) {
    const merchant = getCurrentMerchantFromState(draft);
    if (payload.id) {
      const product = draft.products.find(function (item) {
        return item.id === payload.id && item.merchantId === merchant.id;
      });
      guards.invariant(product, '商品不存在');
      product.name = String(payload.name).trim();
      product.description = String(payload.description || '').trim();
      product.price = Number(payload.price);
      product.stock = Number(payload.stock);
      product.unit = String(payload.unit || '份').trim();
    } else {
      draft.products.unshift({
        id: generateId('product'),
        merchantId: merchant.id,
        name: String(payload.name).trim(),
        description: String(payload.description || '').trim(),
        price: Number(payload.price),
        stock: Number(payload.stock),
        soldCount: 0,
        status: 'on',
        unit: String(payload.unit || '份').trim()
      });
    }
  });
  return getMerchantProductsView();
}

function toggleProductStatus(productId) {
  db.updateState(function (draft) {
    const merchant = getCurrentMerchantFromState(draft);
    const product = draft.products.find(function (item) {
      return item.id === productId && item.merchantId === merchant.id;
    });
    guards.invariant(product, '商品不存在');
    product.status = product.status === 'on' ? 'off' : 'on';
  });
  return getMerchantProductsView();
}

function getProfileView() {
  const state = getState();
  const user = requireCurrentUser(state);
  const merchant = state.merchants.find(function (item) {
    return item.ownerUserId === user.id;
  }) || null;
  return {
    user: clone(user),
    merchant: merchant ? formatMerchant(state, merchant) : null,
    addresses: listAddresses(),
    customerService: clone(state.customerService),
    settings: [
      { key: 'coupon', label: '优惠券', value: user.couponCount + ' 张' },
      { key: 'balance', label: '余额', value: money.formatMoney(user.balance) + ' 元' },
      { key: 'support', label: '客服', value: state.customerService.phone },
      { key: 'notify', label: '消息提醒', value: user.settings.messageNotice ? '已开启' : '已关闭' }
    ]
  };
}

function loginByPhone(phone) {
  guards.ensurePhone(phone);
  let currentUser = null;
  db.updateState(function (draft) {
    let user = draft.users.find(function (item) {
      return item.phone === String(phone).trim();
    });
    if (!user) {
      user = {
        id: generateId('user'),
        phone: String(phone).trim(),
        nickname: '手机用户' + String(phone).trim().slice(-4),
        avatarText: 'NU',
        role: 'user',
        balance: 88,
        couponCount: 1,
        openId: '',
        settings: { messageNotice: true, darkMode: false }
      };
      draft.users.push(user);
    }
    draft.currentUserId = user.id;
    currentUser = clone(user);
  });
  return currentUser;
}

function loginByWechat(nickname) {
  guards.ensureNonEmptyString(nickname, '微信昵称');
  let currentUser = null;
  db.updateState(function (draft) {
    const openId = 'wx_' + String(nickname).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    let user = draft.users.find(function (item) {
      return item.openId === openId;
    });
    if (!user) {
      user = {
        id: generateId('user'),
        phone: '',
        nickname: String(nickname).trim(),
        avatarText: 'WX',
        role: 'user',
        balance: 66,
        couponCount: 2,
        openId: openId,
        settings: { messageNotice: true, darkMode: false }
      };
      draft.users.push(user);
    }
    draft.currentUserId = user.id;
    currentUser = clone(user);
  });
  return currentUser;
}

function logout() {
  db.updateState(function (draft) {
    draft.currentUserId = null;
  });
}

function resetDemoData() {
  return db.resetState();
}

function applyMerchant(payload) {
  guards.ensureNonEmptyString(payload.name, '店铺名称');
  guards.ensureNonEmptyString(payload.category, '店铺分类');
  guards.ensureNonEmptyString(payload.licenseText, '资质说明');
  let merchant = null;
  db.updateState(function (draft) {
    const user = requireCurrentUser(draft);
    guards.invariant(user.role !== 'merchant', '当前账号已经是商家');
    const merchantId = generateId('merchant');
    draft.merchantApplications.unshift({
      id: generateId('apply'),
      userId: user.id,
      merchantId: merchantId,
      name: String(payload.name).trim(),
      category: String(payload.category).trim(),
      licenseText: String(payload.licenseText).trim(),
      status: 'approved',
      createdAt: now()
    });
    draft.merchants.unshift({
      id: merchantId,
      ownerUserId: user.id,
      name: String(payload.name).trim(),
      category: String(payload.category).trim(),
      rating: 5,
      deliveryFee: Number(payload.deliveryFee || 4),
      minOrderAmount: Number(payload.minOrderAmount || 20),
      sales: 0,
      status: 'active',
      notice: String(payload.notice || '欢迎光临新店铺').trim(),
      qualificationImages: [String(payload.licenseText).trim()],
      monthlyIncome: 0
    });
    user.role = 'merchant';
    merchant = draft.merchants[0];
  });
  return clone(merchant);
}

module.exports = {
  STATUS_TEXT,
  REFUND_TEXT,
  getHomeView,
  getMerchantView,
  setCartQuantity,
  clearCart,
  getCartView,
  listAddresses,
  saveAddress,
  getCheckoutView,
  createOrder,
  getOrderDetail,
  payOrder,
  cancelOrder,
  requestRefund,
  acceptOrder,
  rejectOrder,
  markDelivering,
  confirmOrder,
  handleRefund,
  submitReview,
  getUserOrders,
  getMerchantOrders,
  getMerchantDashboardView,
  getMerchantProductsView,
  saveProduct,
  toggleProductStatus,
  getProfileView,
  loginByPhone,
  loginByWechat,
  logout,
  resetDemoData,
  applyMerchant
};
