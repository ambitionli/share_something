const core = require("../shared/core");

const STORAGE_KEY = "LOCAL_SERVICE_MINIAPP_STATE";

function readState() {
  const saved = wx.getStorageSync(STORAGE_KEY);
  if (saved) {
    return saved;
  }

  const state = core.createSeedState();
  wx.setStorageSync(STORAGE_KEY, state);
  return state;
}

function writeState(state) {
  wx.setStorageSync(STORAGE_KEY, state);
}

function withState(handler) {
  const state = readState();
  const result = handler(state);
  writeState(state);
  return result;
}

function withStatusLabel(order) {
  return {
    ...order,
    statusLabel: core.STATUS_LABELS[order.status] || order.status,
    canPay: order.status === core.ORDER_STATUS.PENDING_PAYMENT,
    canRefund:
      order.status === core.ORDER_STATUS.PENDING_ACCEPT ||
      order.status === core.ORDER_STATUS.ACCEPTED,
    canComplete: order.status === core.ORDER_STATUS.DELIVERING,
    canReview: order.status === core.ORDER_STATUS.COMPLETED && !order.reviewId,
    canAccept: order.status === core.ORDER_STATUS.PENDING_ACCEPT,
    canReject: order.status === core.ORDER_STATUS.PENDING_ACCEPT,
    canDeliver: order.status === core.ORDER_STATUS.ACCEPTED
  };
}

function decorateOrders(orders) {
  return orders.map((order) => withStatusLabel(order));
}

function getCurrentUserId() {
  const state = readState();
  return state.session.currentUserId;
}

function getCurrentUser() {
  const state = readState();
  const profile = core.getProfile(state, state.session.currentUserId);
  return profile.user;
}

function bootstrap() {
  const state = readState();
  return {
    currentUserId: state.session.currentUserId,
    profile: core.getProfile(state, state.session.currentUserId)
  };
}

function loginWithPhone(phone, nickname) {
  return withState((state) => {
    const user = core.loginWithPhone(state, { phone, nickname });
    return user;
  });
}

function loginWithWechat(nickname) {
  return withState((state) => {
    const user = core.loginWithWechat(state, { nickname });
    return user;
  });
}

function getHomeData(query) {
  return core.getHomeData(readState(), query || {});
}

function getMerchantDetail(merchantId) {
  return core.getMerchantDetail(readState(), merchantId);
}

function changeCart(productId, delta) {
  const userId = getCurrentUserId();
  return withState((state) => core.upsertCartItem(state, { userId, productId, delta }));
}

function getCart() {
  const userId = getCurrentUserId();
  return core.getCartSummary(readState(), userId);
}

function clearCart() {
  const userId = getCurrentUserId();
  return withState((state) => core.clearCart(state, userId));
}

function createOrder(addressId, remark, couponId) {
  const userId = getCurrentUserId();
  return withState((state) =>
    withStatusLabel(core.createOrder(state, { userId, addressId, remark, couponId }))
  );
}

function payOrder(orderId) {
  const userId = getCurrentUserId();
  return withState((state) => withStatusLabel(core.payOrder(state, { userId, orderId })));
}

function cancelUnpaidOrder(orderId) {
  const userId = getCurrentUserId();
  return withState((state) => withStatusLabel(core.cancelUnpaidOrder(state, { userId, orderId })));
}

function requestRefund(orderId, reason) {
  const userId = getCurrentUserId();
  return withState((state) => withStatusLabel(core.requestRefund(state, { userId, orderId, reason })));
}

function submitReview(orderId, rating, content, images) {
  const userId = getCurrentUserId();
  return withState((state) => core.submitReview(state, { userId, orderId, rating, content, images }));
}

function completeOrder(orderId) {
  const userId = getCurrentUserId();
  return withState((state) => withStatusLabel(core.completeOrder(state, { userId, orderId })));
}

function listOrders(status) {
  const userId = getCurrentUserId();
  return decorateOrders(core.listOrdersForUser(readState(), userId, status));
}

function listMerchantOrders(status) {
  const profile = getProfile();
  if (!profile.user.merchantId) {
    return [];
  }
  return decorateOrders(core.listOrdersForMerchant(readState(), profile.user.merchantId, status));
}

function getProfile() {
  const userId = getCurrentUserId();
  return core.getProfile(readState(), userId);
}

function listAddresses() {
  const userId = getCurrentUserId();
  return core.listAddresses(readState(), userId);
}

function saveAddress(payload) {
  const userId = getCurrentUserId();
  return withState((state) => core.saveAddress(state, { ...payload, userId }));
}

function updateSettings(patch) {
  return withState((state) =>
    core.updateSettings(state, {
      userId: state.session.currentUserId,
      ...patch
    })
  );
}

function applyMerchant(payload) {
  const userId = getCurrentUserId();
  return withState((state) => core.createMerchantApplication(state, { ...payload, userId }));
}

function getMerchantCenterData() {
  const profile = getProfile();
  if (!profile.user.merchantId) {
    return {
      merchant: null,
      overview: null,
      products: [],
      orders: []
    };
  }

  const result = core.getMerchantDashboard(readState(), profile.user.merchantId);
  return {
    ...result,
    orders: decorateOrders(result.orders)
  };
}

function saveMerchantProduct(payload) {
  const profile = getProfile();
  return withState((state) =>
    core.upsertMerchantProduct(state, { ...payload, merchantId: profile.user.merchantId })
  );
}

function toggleMerchantProduct(productId, onShelf) {
  const profile = getProfile();
  return withState((state) =>
    core.toggleProductShelf(state, {
      merchantId: profile.user.merchantId,
      productId,
      onShelf
    })
  );
}

function acceptMerchantOrder(orderId) {
  const profile = getProfile();
  return withState((state) =>
    withStatusLabel(
      core.merchantAcceptOrder(state, {
        merchantId: profile.user.merchantId,
        orderId
      })
    )
  );
}

function rejectMerchantOrder(orderId, reason) {
  const profile = getProfile();
  return withState((state) =>
    withStatusLabel(
      core.merchantRejectOrder(state, {
        merchantId: profile.user.merchantId,
        orderId,
        reason
      })
    )
  );
}

function deliverMerchantOrder(orderId, riderName, courierName) {
  const profile = getProfile();
  return withState((state) =>
    withStatusLabel(
      core.merchantDeliverOrder(state, {
        merchantId: profile.user.merchantId,
        orderId,
        riderName,
        courierName
      })
    )
  );
}

function processRefund(orderId) {
  return withState((state) => withStatusLabel(core.processRefund(state, { orderId })));
}

function resetAll() {
  const state = core.createSeedState();
  writeState(state);
  return state;
}

module.exports = {
  bootstrap,
  getCurrentUser,
  loginWithPhone,
  loginWithWechat,
  getHomeData,
  getMerchantDetail,
  changeCart,
  getCart,
  clearCart,
  createOrder,
  payOrder,
  cancelUnpaidOrder,
  requestRefund,
  processRefund,
  submitReview,
  completeOrder,
  listOrders,
  listMerchantOrders,
  getProfile,
  listAddresses,
  saveAddress,
  updateSettings,
  applyMerchant,
  getMerchantCenterData,
  saveMerchantProduct,
  toggleMerchantProduct,
  acceptMerchantOrder,
  rejectMerchantOrder,
  deliverMerchantOrder,
  resetAll
};
