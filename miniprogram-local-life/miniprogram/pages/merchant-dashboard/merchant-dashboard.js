const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');
const fmt = require('../../utils/format.js');
const app = getApp();

Page({
  data: {
    merchant: null,
    stats: { sales: 0, revenueCents: 0, refunds: 0 },
    revenue: '0.00'
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
      const m = await cloud.call('merchant_my', {});
      if (m && m._id) {
        app.setMerchantId(m._id);
      }
      const stats = await cloud.call('stats_merchant', {});
      this.setData({
        merchant: m,
        stats,
        revenue: fmt.money((stats.revenueCents || 0) / 100)
      });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  goProducts() {
    const id = (this.data.merchant && this.data.merchant._id) || '';
    if (!id) {
      return;
    }
    wx.navigateTo({
      url:
        '/pages/merchant-products/merchant-products?merchantId=' +
        encodeURIComponent(id)
    });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/merchant-orders/merchant-orders' });
  },

  goReg() {
    wx.navigateTo({ url: '/pages/merchant-register/merchant-register' });
  }
});
