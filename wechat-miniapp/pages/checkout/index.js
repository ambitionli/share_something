const appService = require('../../services/appService');

Page({
  data: {
    merchantId: '', cartSummary: { items: [] }, addresses: [], selectedAddressId: '', remark: '', submitting: false
  },
  onLoad(options) {
    this.setData({ merchantId: options.merchantId || '' });
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      const view = appService.getCheckoutView(this.data.merchantId);
      this.setData(view);
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  selectAddress(event) {
    this.setData({ selectedAddressId: event.detail.value });
  },
  onRemarkInput(event) {
    this.setData({ remark: event.detail.value });
  },
  manageAddress() {
    wx.navigateTo({ url: '/pages/address/index' });
  },
  submitOrder() {
    if (this.data.submitting) {
      return;
    }
    this.setData({ submitting: true });
    try {
      const order = appService.createOrder({ merchantId: this.data.merchantId, addressId: this.data.selectedAddressId, remark: this.data.remark });
      wx.showModal({
        title: '模拟支付',
        content: '订单 ' + order.orderNo + ' 已创建，是否立即支付？',
        success: (result) => {
          if (result.confirm) {
            try {
              appService.payOrder(order.id);
              wx.showToast({ title: '支付成功，等待商家接单', icon: 'none' });
            } catch (error) {
              wx.showToast({ title: error.message, icon: 'none' });
            }
          }
          wx.switchTab({ url: '/pages/orders/index' });
        },
        complete: () => {
          this.setData({ submitting: false });
        }
      });
    } catch (error) {
      this.setData({ submitting: false });
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
