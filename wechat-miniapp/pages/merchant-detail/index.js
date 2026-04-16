const api = require("../../services/api");
const { formatMoney } = require("../../utils/format");

Page({
  data: {
    merchantId: "",
    merchant: null,
    products: [],
    cart: null,
    reviews: [],
    user: null,
    loading: true
  },

  onLoad(options) {
    this.setData({
      merchantId: options.id || ""
    });
  },

  onShow() {
    this.loadDetail();
  },

  async loadDetail() {
    this.setData({
      loading: true,
      user: api.getCurrentUser()
    });
    try {
      const result = await api.getMerchantDetail(this.data.merchantId);
      const quantityMap = {};
      if (result.cart && result.cart.items) {
        result.cart.items.forEach((item) => {
          quantityMap[item.productId] = item.quantity;
        });
      }
      this.setData({
        merchant: result.merchant,
        products: result.products.map((item) =>
          Object.assign({}, item, {
            cartQuantity: quantityMap[item.id] || 0
          })
        ),
        cart: result.cart,
        reviews: result.reviews
      });
      wx.setNavigationBarTitle({
        title: result.merchant.name
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  async changeQuantity(event) {
    const user = api.getCurrentUser();
    if (!user) {
      wx.navigateTo({
        url: "/pages/auth-login/index"
      });
      return;
    }

    const productId = event.currentTarget.dataset.productId;
    const delta = Number(event.currentTarget.dataset.delta);
    try {
      await api.updateCartItem(this.data.merchantId, productId, delta);
      await this.loadDetail();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  goCart() {
    wx.switchTab({
      url: "/pages/cart/index"
    });
  }
});
