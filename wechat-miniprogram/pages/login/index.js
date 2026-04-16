const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

Page({
  data: {
    phone: '18800001111',
    nickname: '演示买家',
  },

  onLoad() {
    setTitle('登录');
  },

  onShow() {
    const session = service.getSession();
    if (session.isLoggedIn) {
      wx.reLaunch({ url: '/pages/home/index' });
    }
  },

  onPhoneInput(event) {
    this.setData({ phone: event.detail.value });
  },

  onNicknameInput(event) {
    this.setData({ nickname: event.detail.value });
  },

  async loginAsBuyer() {
    try {
      await service.loginWithPhone({
        phone: this.data.phone,
        nickname: this.data.nickname || '新用户',
        role: 'buyer',
      });
      showSuccess('登录成功');
      wx.reLaunch({ url: '/pages/home/index' });
    } catch (error) {
      showError(error);
    }
  },

  async useBuyerDemo() {
    try {
      await service.useDemoAccount('buyer');
      showSuccess('已进入买家演示账号');
      wx.reLaunch({ url: '/pages/home/index' });
    } catch (error) {
      showError(error);
    }
  },

  async useMerchantDemo() {
    try {
      await service.useDemoAccount('merchant');
      showSuccess('已进入商家演示账号');
      wx.reLaunch({ url: '/pages/merchant-dashboard/index' });
    } catch (error) {
      showError(error);
    }
  },

  async loginWithWechat() {
    try {
      await service.loginWithWechat({ nickname: '微信体验用户' });
      showSuccess('微信授权登录成功');
      wx.reLaunch({ url: '/pages/home/index' });
    } catch (error) {
      showError(error);
    }
  },
});
