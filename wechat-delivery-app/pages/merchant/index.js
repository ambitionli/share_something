const api = require("../../utils/api");
const { showToast } = require("../../utils/helpers");

Page({
  data: {
    merchantId: "",
    merchant: null,
    products: [],
    cart: [],
    cartCountMap: {},
    reviews: [],
    selectedCount: 0,
    selectedAmount: 0
  },

  onLoad(options) {
    this.setData({
      merchantId: options.id
    });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    if (!this.data.merchantId) {
      return;
    }
    const data = api.getMerchantDetail(this.data.merchantId);
    if (data.merchant) {
      wx.setNavigationBarTitle({
        title: data.merchant.name
      });
    }
    const cartCountMap = {};
    data.cart.forEach((item) => {
      cartCountMap[item.productId] = item.quantity;
    });
    this.setData({
      ...data,
      cartCountMap
    });
  },

  changeCount(event) {
    const delta = Number(event.currentTarget.dataset.delta);
    const productId = event.currentTarget.dataset.id;
    try {
      const data = api.updateCart(this.data.merchantId, productId, delta);
      const cartCountMap = {};
      data.cart.forEach((item) => {
        cartCountMap[item.productId] = item.quantity;
      });
      this.setData({
        ...data,
        cartCountMap
      });
    } catch (error) {
      showToast(error.message);
    }
  },

  openCheckout() {
    if (!this.data.selectedCount) {
      showToast("请先选择商品");
      return;
    }
    wx.navigateTo({
      url: `/pages/checkout/index?merchantId=${this.data.merchantId}`
    });
  }
});
