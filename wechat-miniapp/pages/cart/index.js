const appService = require('../../services/appService');

Page({
  data: {
    summary: {
      merchantName: '', items: [], totalCount: 0, subtotalAmount: 0, deliveryFee: 0, totalAmount: 0, minOrderAmount: 0, meetsMinOrder: false
    }
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      this.setData({ summary: appService.getCartView('') });
    } catch (error) {
      wx.navigateTo({ url: '/pages/login/index' });
    }
  },
  changeQuantity(event) {
    const item = event.currentTarget.dataset.item;
    try {
      appService.setCartQuantity({
        merchantId: this.data.summary.merchantId,
        productId: item.productId,
        quantity: Number(item.quantity) + Number(event.currentTarget.dataset.delta)
      });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  clearCart() {
    appService.clearCart(this.data.summary.merchantId);
    this.loadData();
    wx.showToast({ title: '购物车已清空', icon: 'none' });
  },
  goCheckout() {
    if (!this.data.summary.items.length) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    if (!this.data.summary.meetsMinOrder) {
      wx.showToast({ title: '未达到起送价', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/checkout/index?merchantId=' + this.data.summary.merchantId });
  }
});
