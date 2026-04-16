const env = require("./env");
const storage = require("./storage");
const { CATEGORY_OPTIONS, STATUS_META, ORDER_STATUS } = require("../shared/constants");
const { createSeedState } = require("../shared/seed");
const business = require("../shared/business");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function bootstrap() {
  if (!storage.getState()) {
    storage.setState(createSeedState());
  }

  if (env.useCloud && typeof wx !== "undefined" && wx.cloud && typeof wx.cloud.init === "function") {
    wx.cloud.init({
      env: env.cloudEnvId,
      traceUser: true
    });
  }
}

function getState() {
  bootstrap();
  return storage.getState();
}

function saveState(nextState) {
  storage.setState(nextState);
  return nextState;
}

function getCurrentUser() {
  const state = getState();
  return clone(state.users.find((item) => item.id === state.currentUserId) || null);
}

function loginWithPhone(payload) {
  const result = business.loginUser(getState(), payload);
  saveState(result.state);
  return clone(result.user);
}

function loginWithWechat() {
  return loginWithPhone({
    phone: "13600001234",
    nickname: "微信访客"
  });
}

function getHomeData(payload) {
  const state = getState();
  const keyword = ((payload && payload.keyword) || "").trim().toLowerCase();
  const category = (payload && payload.category) || "all";

  const merchants = state.merchants
    .filter((merchant) => merchant.status === "approved")
    .filter((merchant) => {
      if (category !== "all" && merchant.category !== category) {
        return false;
      }
      if (!keyword) {
        return true;
      }
      const merchantMatched = merchant.name.toLowerCase().includes(keyword);
      const productMatched = state.products.some((product) => {
        return (
          product.merchantId === merchant.id &&
          product.isOnShelf &&
          product.name.toLowerCase().includes(keyword)
        );
      });
      return merchantMatched || productMatched;
    })
    .map((merchant) => ({
      ...merchant,
      productCount: state.products.filter((product) => product.merchantId === merchant.id && product.isOnShelf)
        .length
    }));

  return {
    banners: clone(state.banners),
    categories: clone(CATEGORY_OPTIONS),
    merchants
  };
}

function getMerchantDetail(merchantId) {
  const state = getState();
  const merchant = clone(state.merchants.find((item) => item.id === merchantId));
  const products = state.products
    .filter((item) => item.merchantId === merchantId)
    .map((item) => clone(item));
  const cart = clone(state.cartByMerchant[merchantId] || []);
  const reviews = state.reviews
    .filter((item) => item.merchantId === merchantId)
    .slice(0, 5)
    .map((item) => clone(item));
  const selectedCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const selectedAmount = Number(
    cart.reduce((sum, item) => {
      const product = state.products.find((productItem) => productItem.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0).toFixed(2)
  );

  return {
    merchant,
    products,
    cart,
    reviews,
    selectedCount,
    selectedAmount
  };
}

function updateCart(merchantId, productId, delta) {
  const state = clone(getState());
  const product = state.products.find((item) => item.id === productId);
  if (!product || !product.isOnShelf) {
    throw new Error("商品不可购买");
  }

  if (!state.cartByMerchant[merchantId]) {
    state.cartByMerchant[merchantId] = [];
  }

  const cartItems = state.cartByMerchant[merchantId];
  const existing = cartItems.find((item) => item.productId === productId);

  if (!existing && delta < 0) {
    throw new Error("购物车数量不能为负");
  }

  if (!existing) {
    if (delta <= 0) {
      throw new Error("商品数量必须大于 0");
    }
    cartItems.push({
      productId,
      quantity: 0
    });
  }

  const target = cartItems.find((item) => item.productId === productId);
  target.quantity += delta;
  if (target.quantity < 0) {
    throw new Error("购物车数量不能为负");
  }
  if (target.quantity > product.stock) {
    throw new Error("超过可售库存");
  }

  state.cartByMerchant[merchantId] = cartItems.filter((item) => item.quantity > 0);
  saveState(state);
  return getMerchantDetail(merchantId);
}

function getCheckoutData(merchantId, couponId) {
  const state = getState();
  const user = getCurrentUser();
  const cart = (state.cartByMerchant[merchantId] || []).map((item) => {
    const product = state.products.find((productItem) => productItem.id === item.productId);
    return {
      ...clone(item),
      name: product ? product.name : item.productId,
      price: product ? product.price : 0
    };
  });
  const defaultAddress = clone(
    state.addresses.find((item) => item.userId === user.id && item.isDefault) ||
      state.addresses.find((item) => item.userId === user.id) ||
      null
  );
  const summaryResult =
    cart.length > 0
      ? business.calculateCartSummary(state, {
          userId: user.id,
          merchantId,
          items: cart.map((item) => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          couponId
        })
      : null;
  const availableCoupons = state.coupons
    .filter((item) => item.userId === user.id && !item.isUsed)
    .map((item) => clone(item));

  return {
    merchant: clone(state.merchants.find((item) => item.id === merchantId)),
    cart,
    address: defaultAddress,
    summary: summaryResult ? summaryResult.summary : null,
    availableCoupons
  };
}

function createOrder(payload) {
  const user = getCurrentUser();
  const state = getState();
  const cart = clone(state.cartByMerchant[payload.merchantId] || []);
  const result = business.createOrder(state, {
    userId: user.id,
    merchantId: payload.merchantId,
    addressId: payload.addressId,
    items: cart,
    remark: payload.remark,
    couponId: payload.couponId,
    clientToken: payload.clientToken,
    now: payload.now
  });
  saveState(result.state);
  return clone(result.order);
}

function payOrder(orderId) {
  const user = getCurrentUser();
  const result = business.payOrder(getState(), {
    orderId,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.order);
}

function listOrders(filterGroup) {
  const state = getState();
  const user = getCurrentUser();
  return state.orders
    .filter((item) => item.userId === user.id)
    .map((item) => business.getOrderDisplay(item))
    .filter((item) => !filterGroup || filterGroup === "全部" || item.statusGroup === filterGroup)
    .map((item) => ({
      ...item,
      merchant: clone(state.merchants.find((merchant) => merchant.id === item.merchantId))
    }));
}

function getOrderDetail(orderId) {
  const state = getState();
  const order = business.getOrderDisplay(state.orders.find((item) => item.id === orderId));
  return {
    ...clone(order),
    merchant: clone(state.merchants.find((item) => item.id === order.merchantId)),
    address: clone(state.addresses.find((item) => item.id === order.addressId)),
    review: clone(state.reviews.find((item) => item.id === order.reviewId) || null)
  };
}

function requestRefund(orderId, reason) {
  const user = getCurrentUser();
  const result = business.requestRefund(getState(), {
    orderId,
    userId: user.id,
    reason
  });
  saveState(result.state);
  return clone(result.order);
}

function confirmOrder(orderId) {
  const user = getCurrentUser();
  const result = business.completeOrder(getState(), {
    orderId,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.order);
}

function submitReview(payload) {
  const user = getCurrentUser();
  const result = business.submitReview(getState(), {
    orderId: payload.orderId,
    userId: user.id,
    rating: payload.rating,
    content: payload.content,
    images: payload.images
  });
  saveState(result.state);
  return clone(result.review);
}

function getProfileData() {
  const state = getState();
  const user = getCurrentUser();
  const coupons = state.coupons.filter((item) => item.userId === user.id);
  const addresses = state.addresses.filter((item) => item.userId === user.id);
  const merchant = state.merchants.find((item) => item.ownerUserId === user.id) || null;
  return {
    user,
    coupons,
    addresses,
    merchant,
    support: clone(state.support)
  };
}

function updateProfile(payload) {
  const user = getCurrentUser();
  const result = business.updateUserProfile(getState(), {
    userId: user.id,
    ...payload
  });
  saveState(result.state);
  return clone(result.user);
}

function getAddresses() {
  const user = getCurrentUser();
  const state = getState();
  return state.addresses.filter((item) => item.userId === user.id).map((item) => clone(item));
}

function saveAddress(payload) {
  const user = getCurrentUser();
  const result = business.upsertAddress(getState(), {
    ...payload,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.address);
}

function deleteAddress(id) {
  const user = getCurrentUser();
  const result = business.removeAddress(getState(), {
    id,
    userId: user.id
  });
  saveState(result.state);
}

function submitMerchantApplication(payload) {
  const user = getCurrentUser();
  const result = business.submitMerchantApplication(getState(), {
    ...payload,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.merchant);
}

function getOwnedMerchant() {
  const state = getState();
  const user = getCurrentUser();
  return clone(state.merchants.find((item) => item.ownerUserId === user.id) || null);
}

function getMerchantProducts() {
  const merchant = getOwnedMerchant();
  if (!merchant) {
    return [];
  }
  const state = getState();
  return state.products.filter((item) => item.merchantId === merchant.id).map((item) => clone(item));
}

function saveProduct(payload) {
  const user = getCurrentUser();
  const merchant = getOwnedMerchant();
  if (!merchant) {
    throw new Error("请先完成商家入驻");
  }
  const result = business.upsertProduct(getState(), {
    ...payload,
    merchantId: merchant.id,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.product);
}

function toggleProductShelf(productId, isOnShelf) {
  const user = getCurrentUser();
  const merchant = getOwnedMerchant();
  if (!merchant) {
    throw new Error("请先完成商家入驻");
  }
  const result = business.toggleProductShelf(getState(), {
    merchantId: merchant.id,
    userId: user.id,
    productId,
    isOnShelf
  });
  saveState(result.state);
  return clone(result.product);
}

function getMerchantOrders() {
  const merchant = getOwnedMerchant();
  if (!merchant) {
    return [];
  }
  const state = getState();
  return state.orders
    .filter((item) => item.merchantId === merchant.id)
    .map((item) => business.getOrderDisplay(item))
    .map((item) => ({
      ...item,
      address: clone(state.addresses.find((address) => address.id === item.addressId)),
      user: clone(state.users.find((user) => user.id === item.userId))
    }));
}

function acceptMerchantOrder(orderId) {
  const user = getCurrentUser();
  const merchant = getOwnedMerchant();
  if (!merchant) {
    throw new Error("请先完成商家入驻");
  }
  const result = business.acceptOrder(getState(), {
    orderId,
    merchantId: merchant.id,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.order);
}

function rejectMerchantOrder(orderId, reason) {
  const user = getCurrentUser();
  const merchant = getOwnedMerchant();
  if (!merchant) {
    throw new Error("请先完成商家入驻");
  }
  const result = business.rejectOrder(getState(), {
    orderId,
    merchantId: merchant.id,
    userId: user.id,
    reason
  });
  saveState(result.state);
  return clone(result.order);
}

function markMerchantDelivering(orderId) {
  const user = getCurrentUser();
  const merchant = getOwnedMerchant();
  if (!merchant) {
    throw new Error("请先完成商家入驻");
  }
  const result = business.markDelivering(getState(), {
    orderId,
    merchantId: merchant.id,
    userId: user.id
  });
  saveState(result.state);
  return clone(result.order);
}

function handleMerchantRefund(orderId, approve) {
  const user = getCurrentUser();
  const merchant = getOwnedMerchant();
  if (!merchant) {
    throw new Error("请先完成商家入驻");
  }
  const result = business.handleRefund(getState(), {
    orderId,
    merchantId: merchant.id,
    userId: user.id,
    approve
  });
  saveState(result.state);
  return clone(result.order);
}

function getMerchantStats() {
  const merchant = getOwnedMerchant();
  if (!merchant) {
    return null;
  }
  return business.getMerchantStatistics(getState(), merchant.id);
}

function getStatusGroups() {
  return ["全部", "待支付", "待接单", "配送中", "已完成", "退款"];
}

function getStatusLabel(status) {
  return STATUS_META[status].label;
}

function resetDemo() {
  const state = createSeedState();
  saveState(state);
  return state;
}

module.exports = {
  bootstrap,
  getCurrentUser,
  loginWithPhone,
  loginWithWechat,
  getHomeData,
  getMerchantDetail,
  updateCart,
  getCheckoutData,
  createOrder,
  payOrder,
  listOrders,
  getOrderDetail,
  requestRefund,
  confirmOrder,
  submitReview,
  getProfileData,
  updateProfile,
  getAddresses,
  saveAddress,
  deleteAddress,
  submitMerchantApplication,
  getOwnedMerchant,
  getMerchantProducts,
  saveProduct,
  toggleProductShelf,
  getMerchantOrders,
  acceptMerchantOrder,
  rejectMerchantOrder,
  markMerchantDelivering,
  handleMerchantRefund,
  getMerchantStats,
  getStatusGroups,
  getStatusLabel,
  resetDemo,
  ORDER_STATUS
};
