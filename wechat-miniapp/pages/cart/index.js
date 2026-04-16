const store = require("../../utils/store");
const format = require("../../utils/format");

Page({
  data: {
    cart: {
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      packageFee: 0,
      total: 0,
      merchantName: ""
    }
  },

  onShow() {
    this.loadCart();
  },

  loadCart() {
    const cart = store.getCart();
    this.setData({
      cart: {
        ...cart,
        subtotalText: format.price(cart.subtotal),
        deliveryFeeText: format.price(cart.deliveryFee),
        packageFeeText: format.price(cart.packageFee),
        totalText: format.price(cart.total)
      }
    });
  },

  increase(event) {
    this.change(event.currentTarget.dataset.id, 1);
  },

  decrease(event) {
    this.change(event.currentTarget.dataset.id, -1);
  },

  change(productId, delta) {
    try {
      store.changeCart(productId, delta);
      this.loadCart();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  clearCart() {
    store.clearCart();
    this.loadCart();
    wx.showToast({ title: "购物车已清空", icon: "success" });
  },

  goCheckout() {
    if (!this.data.cart.items.length) {
      wx.showToast({ title: "请先添加商品", icon: "none" });
      return;
    }
    wx.navigateTo({ url: "/pages/checkout/index" });
  },

  goHome() {
    wx.switchTab({ url: "/pages/home/index" });
  }
});
