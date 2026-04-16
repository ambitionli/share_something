const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function decorateProfile(profile) {
  return {
    ...profile,
    user: {
      ...profile.user,
      phoneText: profile.user.phone || '微信演示账号',
    },
  };
}

Page({
  data: {
    profile: null,
  },

  onLoad() {
    setTitle('个人中心');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      this.setData({ profile: decorateProfile(service.getProfile()) });
    } catch (error) {
      showError(error);
    }
  },

  goAddresses() {
    wx.navigateTo({ url: '/pages/address/index' });
  },

  goCoupons() {
    wx.navigateTo({ url: '/pages/coupons/index' });
  },

  goSettings() {
    wx.navigateTo({ url: '/pages/settings/index' });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/orders/index' });
  },

  goMerchant() {
    if (this.data.profile && this.data.profile.merchant) {
      wx.navigateTo({ url: '/pages/merchant-dashboard/index' });
      return;
    }
    wx.navigateTo({ url: '/pages/merchant-apply/index' });
  },

  callSupport() {
    showSuccess('客服演示：400-880-1234');
  },

  async logout() {
    try {
      await service.logout();
      showSuccess('已退出登录');
      wx.reLaunch({ url: '/pages/login/index' });
    } catch (error) {
      showError(error);
    }
  },
});
