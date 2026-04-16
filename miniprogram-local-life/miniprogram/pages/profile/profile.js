const app = getApp();
const cloud = require('../../utils/cloud.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    user: {},
    balance: '0.00',
    avatarLetter: '邻'
  },

  onShow() {
    const u = app.globalData.user || {};
    const name = u.nickName || '';
    const letter = name ? String(name).charAt(0) : '邻';
    this.setData({
      user: u,
      balance: fmt.money(u.balance != null ? u.balance : 0),
      avatarLetter: letter
    });
  },

  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  goAddr() {
    wx.navigateTo({ url: '/pages/addresses/addresses' });
  },

  goCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' });
  },

  goMerchantReg() {
    wx.navigateTo({ url: '/pages/merchant-register/merchant-register' });
  },

  goMerchantDash() {
    wx.navigateTo({ url: '/pages/merchant-dashboard/merchant-dashboard' });
  },

  goService() {
    wx.navigateTo({ url: '/pages/service/service' });
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  async seedDemo() {
    wx.showLoading({ title: '初始化' });
    try {
      await cloud.call('seed_demo', {});
      wx.showToast({ title: '演示数据已就绪' });
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
