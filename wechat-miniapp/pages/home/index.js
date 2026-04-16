const api = require("../../services/api");

Page({
  data: {
    keyword: "",
    currentCategory: "",
    banners: [],
    categories: [],
    merchants: [],
    user: null,
    loading: true
  },

  onShow() {
    this.loadPageData();
  },

  async loadPageData() {
    this.setData({
      loading: true,
      user: api.getCurrentUser()
    });
    try {
      const result = await api.getHomeData(
        this.data.keyword,
        this.data.currentCategory
      );
      this.setData({
        banners: result.banners,
        categories: result.categories,
        merchants: result.merchants
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

  onKeywordInput(event) {
    this.setData({
      keyword: event.detail.value
    });
  },

  handleSearch() {
    this.loadPageData();
  },

  switchCategory(event) {
    const category = event.currentTarget.dataset.category;
    this.setData({
      currentCategory: category === this.data.currentCategory ? "" : category
    });
    this.loadPageData();
  },

  openMerchant(event) {
    const merchantId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/merchant-detail/index?id=${merchantId}`
    });
  },

  openLogin() {
    wx.navigateTo({
      url: "/pages/auth-login/index"
    });
  },

  openMerchantCenter() {
    const user = api.getCurrentUser();
    if (!user) {
      wx.navigateTo({
        url: "/pages/auth-login/index"
      });
      return;
    }
    wx.navigateTo({
      url: "/pages/merchant-center/index"
    });
  }
});
