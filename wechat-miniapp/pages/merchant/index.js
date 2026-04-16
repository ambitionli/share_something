const appService = require('../../services/appService');

Page({
  data: {
    merchantId: '',
    merchant: null,
    products: [],
    cartSummary: { totalCount: 0, totalAmount: 0 }
  },
  onLoad(options) {
    this.setData({ merchantId: options.id || '' });
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      const view = appService.getMerchantView(this.data.merchantId);
      this.setData(view);
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  changeQuantity(event) {
    const dataset = event.currentTarget.dataset;
    try {
      appService.setCartQuantity({
        merchantId: this.data.merchantId,
        productId: dataset.productId,
        quantity: Number(dataset.quantity) + Number(dataset.delta)
      });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  goCart() {
    wx.switchTab({ url: '/pages/cart/index' });
  }
});
