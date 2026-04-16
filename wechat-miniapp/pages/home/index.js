const appService = require('../../services/appService');

Page({
  data: {
    keywordInput: '',
    activeCategory: '全部',
    categories: ['全部'],
    banners: [],
    merchants: [],
    currentUser: null,
    cartSummary: { totalCount: 0 }
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      const view = appService.getHomeView({
        keyword: this.data.keywordInput,
        category: this.data.activeCategory
      });
      this.setData(view);
    } catch (error) {
      wx.navigateTo({ url: '/pages/login/index' });
    }
  },
  onSearchInput(event) {
    this.setData({ keywordInput: event.detail.value });
  },
  submitSearch() {
    this.loadData();
  },
  selectCategory(event) {
    this.setData({ activeCategory: event.currentTarget.dataset.category }, () => {
      this.loadData();
    });
  },
  openMerchant(event) {
    wx.navigateTo({ url: '/pages/merchant/index?id=' + event.currentTarget.dataset.id });
  },
  resetDemoData() {
    appService.resetDemoData();
    this.setData({ keywordInput: '', activeCategory: '全部' }, () => this.loadData());
    wx.showToast({ title: '已恢复初始数据', icon: 'none' });
  }
});
