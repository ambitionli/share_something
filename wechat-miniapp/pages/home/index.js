const store = require("../../utils/store");
const format = require("../../utils/format");

Page({
  data: {
    banners: [],
    categories: [],
    merchants: [],
    keyword: "",
    activeCategoryId: ""
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData();
    wx.stopPullDownRefresh();
  },

  loadData() {
    const data = store.getHomeData({
      keyword: this.data.keyword,
      categoryId: this.data.activeCategoryId
    });

    this.setData({
      banners: data.banners,
      categories: data.categories,
      merchants: data.merchants.map((merchant) => ({
        ...merchant,
        scoreText: merchant.score.toFixed(1)
      }))
    });
  },

  handleKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
  },

  search() {
    this.loadData();
  },

  selectCategory(event) {
    const categoryId = event.currentTarget.dataset.id;
    this.setData({
      activeCategoryId: this.data.activeCategoryId === categoryId ? "" : categoryId
    });
    this.loadData();
  },

  openMerchant(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/merchant/index?id=${id}` });
  },

  formatPrice(event) {
    return format.price(event);
  }
});
