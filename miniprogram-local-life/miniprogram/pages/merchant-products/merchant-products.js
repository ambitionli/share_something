const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    merchantId: '',
    products: []
  },

  onLoad(q) {
    const id = q.merchantId ? decodeURIComponent(q.merchantId) : '';
    this.setData({ merchantId: id });
  },

  onShow() {
    if (!auth.requireLogin()) {
      return;
    }
    this.load();
  },

  async load() {
    wx.showNavigationBarLoading();
    try {
      const list = await cloud.call('product_list', {
        merchantId: this.data.merchantId
      });
      this.setData({ products: list || [] });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  add() {
    wx.navigateTo({
      url:
        '/pages/merchant-product-edit/merchant-product-edit?merchantId=' +
        encodeURIComponent(this.data.merchantId)
    });
  },

  edit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:
        '/pages/merchant-product-edit/merchant-product-edit?merchantId=' +
        encodeURIComponent(this.data.merchantId) +
        '&productId=' +
        encodeURIComponent(id)
    });
  }
});
