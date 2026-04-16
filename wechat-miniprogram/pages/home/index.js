const service = require('../../services/app-service');
const { setTitle, showError } = require('../../utils/page');

function decorateCategories(categories, currentCategory) {
  return categories.map((item) => ({
    ...item,
    activeClass: currentCategory === item.id ? 'category-chip-active' : '',
  }));
}

function buildViewModel(session, home, currentCategory) {
  return {
    session: {
      ...session,
      displayName: session.user && session.user.nickname ? session.user.nickname : '游客',
    },
    banners: home.banners,
    categories: decorateCategories(home.categories, currentCategory),
    merchants: home.merchants,
  };
}

Page({
  data: {
    session: { user: { nickname: '游客' }, displayName: '游客' },
    keyword: '',
    currentCategory: 'all',
    banners: [],
    categories: [],
    merchants: [],
  },

  onLoad() {
    setTitle('首页');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const session = service.getSession();
      const home = service.getHomeData({
        keyword: this.data.keyword,
        category: this.data.currentCategory,
      });
      this.setData(buildViewModel(session, home, this.data.currentCategory));
    } catch (error) {
      showError(error);
    }
  },

  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
  },

  onSearch() {
    this.refresh();
  },

  onSelectCategory(event) {
    this.setData({ currentCategory: event.currentTarget.dataset.id });
    this.refresh();
  },

  openStore(event) {
    wx.navigateTo({ url: `/pages/store/index?merchantId=${event.currentTarget.dataset.id}` });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/index' });
  },

  goProfile() {
    wx.navigateTo({ url: '/pages/profile/index' });
  },

  goMerchant() {
    const session = service.getSession();
    if (session.isMerchant) {
      wx.navigateTo({ url: '/pages/merchant-dashboard/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/merchant-apply/index' });
  },
});
