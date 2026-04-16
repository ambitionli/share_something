const env = require('../config/env');
const engine = require('../shared/engine');
const { createSeedState } = require('../shared/seed');
const { STORAGE_KEYS, STATUS_LABELS, ORDER_TAB_DEFS, PAYMENT_METHODS } = require('../shared/constants');
const cloudAdapter = require('./cloud-adapter');

let state = null;

function hasWx() {
  return typeof wx !== 'undefined';
}

function safeStorageRead(key) {
  if (!hasWx()) {
    return null;
  }
  try {
    return wx.getStorageSync(key);
  } catch (error) {
    console.error('storage read failed', error);
    return null;
  }
}

function safeStorageWrite(key, value) {
  if (!hasWx()) {
    return;
  }
  try {
    wx.setStorageSync(key, value);
  } catch (error) {
    console.error('storage write failed', error);
  }
}

function hydrate() {
  if (state) {
    return state;
  }
  const stored = safeStorageRead(STORAGE_KEYS.state);
  state = stored && stored.meta ? stored : createSeedState();
  const settings = safeStorageRead(STORAGE_KEYS.settings);
  if (settings && typeof settings.useCloud === 'boolean') {
    state.settings.useCloud = settings.useCloud;
  } else {
    state.settings.useCloud = env.useCloud;
  }
  return state;
}

function persist(nextState) {
  state = nextState;
  safeStorageWrite(STORAGE_KEYS.state, state);
  safeStorageWrite(STORAGE_KEYS.settings, { useCloud: state.settings.useCloud });
}

function bootstrap() {
  hydrate();
  if (hasWx() && wx.cloud && wx.cloud.init) {
    try {
      wx.cloud.init({
        env: env.cloudEnvId || undefined,
        traceUser: true,
      });
    } catch (error) {
      console.error('cloud init failed', error);
    }
  }
}

function getState() {
  return hydrate();
}

function clone(value) {
  return engine.clone(value);
}

function currentUser(stateValue) {
  return (stateValue.users || []).find((item) => item.id === stateValue.session.currentUserId) || null;
}

function decorateOrder(order) {
  return {
    ...clone(order),
    statusLabel: STATUS_LABELS[order.status] || order.status,
  };
}

function decorateOrders(orders) {
  return orders.map((item) => decorateOrder(item));
}

function maybeCloudAction(actionName, payload) {
  const nextState = getState();
  if (!nextState.settings.useCloud) {
    return null;
  }
  return cloudAdapter.call(actionName, payload);
}

async function useCloudOrLocal(actionName, payload, localRunner) {
  const remote = maybeCloudAction(actionName, payload);
  if (remote) {
    return remote;
  }
  const working = clone(getState());
  const result = localRunner(working);
  persist(working);
  return result;
}

function readOnlyLocal(localRunner) {
  return localRunner(clone(getState()));
}

async function loginWithPhone(payload) {
  return useCloudOrLocal('loginWithPhone', payload, (working) => engine.loginWithPhone(working, payload));
}

async function loginWithWechat(payload) {
  return useCloudOrLocal('loginWithWechat', payload, (working) => engine.loginWithWechat(working, payload));
}

function useDemoAccount(role) {
  if (role === 'merchant') {
    return loginWithPhone({ phone: '16600002222', nickname: '掌柜小张', role: 'merchant' });
  }
  return loginWithPhone({ phone: '18800001111', nickname: '演示买家', role: 'buyer' });
}

async function logout() {
  return useCloudOrLocal('logout', {}, (working) => {
    engine.logout(working);
    return true;
  });
}

function getSession() {
  const snapshot = getState();
  const user = currentUser(snapshot);
  return {
    user: user ? clone(user) : null,
    isLoggedIn: Boolean(user),
    isMerchant: Boolean(user && user.merchantId),
    useCloud: snapshot.settings.useCloud,
  };
}

function resetDemoData() {
  const fresh = createSeedState();
  fresh.settings.useCloud = false;
  persist(fresh);
  return getSession();
}

function setUseCloud(flag) {
  const working = clone(getState());
  working.settings.useCloud = Boolean(flag);
  persist(working);
  return working.settings.useCloud;
}

function getHomeData(query) {
  return readOnlyLocal((working) => engine.listHomeMerchants(working, query));
}

function getMerchantDetail(merchantId) {
  return readOnlyLocal((working) => engine.getMerchantDetail(working, merchantId));
}

async function updateCartItem(payload) {
  return useCloudOrLocal('updateCartItem', payload, (working) => engine.updateCartItem(working, payload));
}

async function setCartRemark(remark) {
  return useCloudOrLocal('setCartRemark', { remark }, (working) => engine.setCartRemark(working, { remark }));
}

async function clearCart() {
  return useCloudOrLocal('clearCart', {}, (working) => engine.clearCart(working));
}

function getCart() {
  return readOnlyLocal((working) => engine.getCartSummary(working));
}

function getCheckoutPreview(payload) {
  return readOnlyLocal((working) => engine.quoteCheckout(working, payload || {}));
}

async function createOrder(payload) {
  return useCloudOrLocal('createOrder', payload, (working) => engine.createOrder(working, payload));
}

async function payOrder(payload) {
  return useCloudOrLocal('payOrder', payload, (working) => engine.payOrder(working, payload));
}

function listOrders(tab) {
  return readOnlyLocal((working) => decorateOrders(engine.listOrdersByUser(working, { tab })));
}

function getOrderDetail(orderId) {
  return readOnlyLocal((working) => {
    const detail = engine.getOrderDetail(working, orderId);
    return {
      ...detail,
      order: decorateOrder(detail.order),
    };
  });
}

async function requestRefund(payload) {
  return useCloudOrLocal('requestRefund', payload, (working) => engine.requestRefund(working, payload));
}

async function processRefund(payload) {
  return useCloudOrLocal('processRefund', payload, (working) => engine.processRefund(working, payload));
}

async function completeOrder(payload) {
  return useCloudOrLocal('completeOrder', payload, (working) => engine.completeOrder(working, payload));
}

async function submitReview(payload) {
  return useCloudOrLocal('submitReview', payload, (working) => engine.submitReview(working, payload));
}

function listCoupons() {
  return readOnlyLocal((working) => engine.listCouponsByUser(working));
}

function listAddresses() {
  return readOnlyLocal((working) => engine.listAddressesByUser(working));
}

async function saveAddress(payload) {
  return useCloudOrLocal('saveAddress', payload, (working) => engine.saveAddress(working, payload));
}

async function deleteAddress(id) {
  return useCloudOrLocal('deleteAddress', { id }, (working) => engine.deleteAddress(working, { id }));
}

async function setDefaultAddress(id) {
  return useCloudOrLocal('setDefaultAddress', { id }, (working) => engine.setDefaultAddress(working, { id }));
}

async function merchantApply(payload) {
  return useCloudOrLocal('merchantApply', payload, (working) => engine.merchantApply(working, payload));
}

function getMerchantDashboard() {
  return readOnlyLocal((working) => engine.getMerchantDashboard(working, {}));
}

function listMerchantProducts() {
  return readOnlyLocal((working) => engine.listMerchantProducts(working, {}));
}

async function saveMerchantProduct(payload) {
  return useCloudOrLocal('saveMerchantProduct', payload, (working) => engine.saveMerchantProduct(working, payload));
}

async function toggleMerchantProduct(productId) {
  return useCloudOrLocal('toggleMerchantProduct', { productId }, (working) => engine.toggleMerchantProduct(working, { productId }));
}

function listMerchantOrders(filter) {
  return readOnlyLocal((working) => decorateOrders(engine.listMerchantOrders(working, { filter })));
}

async function merchantHandleOrder(payload) {
  return useCloudOrLocal('merchantHandleOrder', payload, (working) => engine.merchantHandleOrder(working, payload));
}

function getProfile() {
  return readOnlyLocal((working) => engine.getProfile(working));
}

function getOrderTabs() {
  return clone(ORDER_TAB_DEFS);
}

function getPaymentMethods() {
  return clone(PAYMENT_METHODS);
}

module.exports = {
  bootstrap,
  getSession,
  loginWithPhone,
  loginWithWechat,
  useDemoAccount,
  logout,
  resetDemoData,
  setUseCloud,
  getHomeData,
  getMerchantDetail,
  updateCartItem,
  setCartRemark,
  clearCart,
  getCart,
  getCheckoutPreview,
  createOrder,
  payOrder,
  listOrders,
  getOrderDetail,
  requestRefund,
  processRefund,
  completeOrder,
  submitReview,
  listCoupons,
  listAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  merchantApply,
  getMerchantDashboard,
  listMerchantProducts,
  saveMerchantProduct,
  toggleMerchantProduct,
  listMerchantOrders,
  merchantHandleOrder,
  getProfile,
  getOrderTabs,
  getPaymentMethods,
};
