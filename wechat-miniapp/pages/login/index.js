const appService = require('../../services/appService');

Page({
  data: {
    phone: '18800000001',
    nickname: '微信演示用户',
    quickAccounts: [
      { label: '买家演示账号', phone: '18800000001' },
      { label: '商家演示账号', phone: '18800000002' }
    ]
  },
  onShow() {
    try {
      appService.getProfileView();
      wx.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      // Keep login page visible when user is not logged in.
    }
  },
  onPhoneInput(event) {
    this.setData({ phone: event.detail.value });
  },
  onNicknameInput(event) {
    this.setData({ nickname: event.detail.value });
  },
  useDemoAccount(event) {
    this.setData({ phone: event.currentTarget.dataset.phone });
  },
  loginByPhone() {
    try {
      const user = appService.loginByPhone(this.data.phone);
      wx.showToast({ title: '登录成功：' + user.nickname, icon: 'none' });
      wx.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  loginByWechat() {
    try {
      const user = appService.loginByWechat(this.data.nickname);
      wx.showToast({ title: '欢迎你，' + user.nickname, icon: 'none' });
      wx.switchTab({ url: '/pages/home/index' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  resetDemoData() {
    appService.resetDemoData();
    wx.showToast({ title: '演示数据已重置', icon: 'none' });
    this.setData({ phone: '18800000001', nickname: '微信演示用户' });
  }
});
