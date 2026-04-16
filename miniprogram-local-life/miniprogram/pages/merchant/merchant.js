const cloud = require('../../utils/cloud.js');
const cartUtil = require('../../utils/cart.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    merchantId: '',
    merchant: null,
    products: [],
    cart: {},
    subtotal: '0.00'
  },

  onLoad(q) {
    const id = q.id ? decodeURIComponent(q.id) : '';
    this.setData({ merchantId: id });
    this.load();
  },

  onShow() {
    this.refreshCartMap();
  },

  async load() {
    wx.showNavigationBarLoading();
    try {
      const m = await cloud.call('merchant_detail', {
        merchantId: this.data.merchantId
      });
      const products = await cloud.call('product_list', {
        merchantId: this.data.merchantId
      });
      this.setData({ merchant: m, products });
      this.refreshCartMap();
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  refreshCartMap() {
    const b = cartUtil.getBucket(this.data.merchantId);
    const cart = { ...b.items };
    let sub = 0;
    for (const p of this.data.products) {
      const q = cart[p._id] || 0;
      if (q > 0) {
        sub += Number(p.price) * q;
      }
    }
    this.setData({
      cart,
      subtotal: fmt.money(sub)
    });
  },

  inc(e) {
    const id = e.currentTarget.dataset.id;
    const cur = cartUtil.getBucket(this.data.merchantId).items[id] || 0;
    cartUtil.setQty(this.data.merchantId, id, cur + 1);
    this.refreshCartMap();
  },

  dec(e) {
    const id = e.currentTarget.dataset.id;
    const cur = cartUtil.getBucket(this.data.merchantId).items[id] || 0;
    cartUtil.setQty(this.data.merchantId, id, cur - 1);
    this.refreshCartMap();
  },

  goCart() {
    wx.navigateTo({
      url:
        '/pages/cart/cart?merchantId=' +
        encodeURIComponent(this.data.merchantId)
    });
  }
});
