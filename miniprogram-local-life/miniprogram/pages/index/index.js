const cloud = require('../../utils/cloud.js');

Page({
  data: {
    keyword: '',
    activeCat: '',
    categories: [
      { key: '', label: '全部' },
      { key: 'food', label: '餐饮' },
      { key: 'market', label: '超市' },
      { key: 'medicine', label: '药品' },
      { key: 'fresh', label: '生鲜' }
    ],
    banners: ['今日鲜配 · 30 分钟达', '新客礼包 · 满减优惠', '售后无忧 · 极速退款'],
    merchants: []
  },

  onShow() {
    this.loadMerchants();
  },

  async onLoad() {
    try {
      await cloud.call('seed_demo', {});
    } catch (e) {
      console.warn('seed_demo', e);
    }
  },

  onKeyword(e) {
    this.setData({ keyword: e.detail.value });
  },

  onCat(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ activeCat: key });
    this.loadMerchants();
  },

  onSearch() {
    this.loadMerchants();
  },

  async loadMerchants() {
    wx.showNavigationBarLoading();
    try {
      const list = await cloud.call('merchant_list', {
        category: this.data.activeCat
      });
      const kw = (this.data.keyword || '').trim().toLowerCase();
      let filtered = list;
      if (kw) {
        filtered = list.filter((m) => (m.name || '').toLowerCase().includes(kw));
      }
      this.setData({ merchants: filtered });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  openMerchant(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/merchant/merchant?id=' + encodeURIComponent(id)
    });
  }
});
