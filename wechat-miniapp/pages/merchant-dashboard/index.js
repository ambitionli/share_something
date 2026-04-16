const appService = require('../../services/appService');

Page({
  data: { merchant: null, stats: null, recentOrders: [] },
  onShow() {
    try {
      this.setData(appService.getMerchantDashboardView());
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  openProducts() {
    wx.navigateTo({ url: '/pages/merchant-products/index' });
  },
  openOrders() {
    wx.navigateTo({ url: '/pages/merchant-orders/index' });
  }
});
