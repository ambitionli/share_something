const api = require("../../utils/api");

Page({
  data: {
    banners: [],
    categories: [],
    merchants: [],
    activeCategory: "all",
    keyword: ""
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const data = api.getHomeData({
      keyword: this.data.keyword,
      category: this.data.activeCategory
    });
    this.setData(data);
  },

  onSearchInput(event) {
    this.setData({
      keyword: event.detail.value
    });
    this.loadData();
  },

  switchCategory(event) {
    this.setData({
      activeCategory: event.currentTarget.dataset.id
    });
    this.loadData();
  },

  openMerchant(event) {
    wx.navigateTo({
      url: `/pages/merchant/index?id=${event.currentTarget.dataset.id}`
    });
  }
});
