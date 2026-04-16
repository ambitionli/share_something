const store = require("../../utils/store");
const format = require("../../utils/format");

Page({
  data: {
    merchantId: "",
    merchant: null,
    products: [],
    reviews: []
  },

  onLoad(options) {
    this.setData({ merchantId: options.id || "" });
    this.loadData();
  },

  onShow() {
    if (this.data.merchantId) {
      this.loadData();
    }
  },

  loadData() {
    try {
      const data = store.getMerchantDetail(this.data.merchantId);
      this.setData({
        merchant: {
          ...data.merchant,
          scoreText: data.merchant.score.toFixed(1)
        },
        products: data.products.map((product) => ({
          ...product,
          priceText: format.price(product.price)
        })),
        reviews: data.reviews
      });
      wx.setNavigationBarTitle({ title: data.merchant.name });
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  addToCart(event) {
    try {
      const productId = event.currentTarget.dataset.id;
      store.changeCart(productId, 1);
      wx.showToast({ title: "已加入购物车", icon: "success" });
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  goCart() {
    wx.switchTab({ url: "/pages/cart/index" });
  }
});
