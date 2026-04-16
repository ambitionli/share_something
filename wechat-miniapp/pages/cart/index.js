const api = require("../../services/api");

Page({
  data: {
    user: null,
    carts: [],
    totalCount: 0,
    totalPayable: 0
  },

  onShow() {
    this.loadCart();
  },

  async loadCart() {
    const user = api.getCurrentUser();
    this.setData({
      user
    });
    if (!user) {
      this.setData({
        carts: [],
        totalCount: 0,
        totalPayable: 0
      });
      return;
    }

    try {
      const result = await api.listCart();
      this.setData({
        carts: result.carts,
        totalCount: result.totalCount,
        totalPayable: result.totalPayable
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  openLogin() {
    wx.navigateTo({
      url: "/pages/auth-login/index"
    });
  },

  openHome() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },

  async changeQuantity(event) {
    const merchantId = event.currentTarget.dataset.merchantId;
    const productId = event.currentTarget.dataset.productId;
    const delta = Number(event.currentTarget.dataset.delta);
    try {
      await api.updateCartItem(merchantId, productId, delta);
      await this.loadCart();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async clearMerchantCart(event) {
    const merchantId = event.currentTarget.dataset.merchantId;
    try {
      await api.clearCart(merchantId);
      wx.showToast({
        title: "已清空购物车",
        icon: "none"
      });
      await this.loadCart();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  checkoutMerchant(event) {
    const merchantId = event.currentTarget.dataset.merchantId;
    wx.navigateTo({
      url: `/pages/checkout/index?merchantId=${merchantId}`
    });
  }
});
