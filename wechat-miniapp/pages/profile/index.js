const appService = require('../../services/appService');

Page({
  data: { user: null, merchant: null, addresses: [], settings: [], customerService: null },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      this.setData(appService.getProfileView());
    } catch (error) {
      wx.navigateTo({ url: '/pages/login/index' });
    }
  },
  openAddress() { wx.navigateTo({ url: '/pages/address/index' }); },
  openMerchantEntry() { wx.navigateTo({ url: '/pages/merchant-entry/index' }); },
  openMerchantProducts() { wx.navigateTo({ url: '/pages/merchant-products/index' }); },
  openMerchantOrders() { wx.navigateTo({ url: '/pages/merchant-orders/index' }); },
  openMerchantDashboard() { wx.navigateTo({ url: '/pages/merchant-dashboard/index' }); },
  logout() {
    appService.logout();
    wx.navigateTo({ url: '/pages/login/index' });
  },
  resetDemoData() {
    appService.resetDemoData();
    this.loadData();
    wx.showToast({ title: '数据已重置', icon: 'none' });
  }
});
