/**
 * 购物车以 merchantId 为命名空间：{ [merchantId]: { items: { [productId]: qty }, remark: string } }
 */

function getAppCart() {
  const app = getApp();
  if (!app.globalData.cart) {
    app.globalData.cart = {};
  }
  return app.globalData.cart;
}

function getBucket(merchantId) {
  const cart = getAppCart();
  if (!cart[merchantId]) {
    cart[merchantId] = { items: {}, remark: '' };
  }
  return cart[merchantId];
}

function setQty(merchantId, productId, qty) {
  const b = getBucket(merchantId);
  const q = Math.max(0, Math.floor(Number(qty) || 0));
  if (q <= 0) {
    delete b.items[productId];
  } else {
    b.items[productId] = q;
  }
  persist();
}

function setRemark(merchantId, remark) {
  const b = getBucket(merchantId);
  b.remark = String(remark || '').slice(0, 200);
  persist();
}

function clearMerchant(merchantId) {
  const cart = getAppCart();
  delete cart[merchantId];
  persist();
}

function persist() {
  try {
    wx.setStorageSync('cart', getAppCart());
  } catch (e) {
    console.warn('cart persist', e);
  }
}

function loadFromStorage() {
  try {
    const c = wx.getStorageSync('cart');
    if (c && typeof c === 'object') {
      getApp().globalData.cart = c;
    }
  } catch (e) {
    console.warn('cart load', e);
  }
}

module.exports = {
  getAppCart,
  getBucket,
  setQty,
  setRemark,
  clearMerchant,
  loadFromStorage
};
