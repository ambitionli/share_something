const cloud = require('../../utils/cloud.js');
const app = getApp();

Page({
  data: {
    phone: ''
  },

  onPhone(e) {
    this.setData({ phone: e.detail.value });
  },

  async loginPhone() {
    const phone = (this.data.phone || '').trim();
    if (!/^1\d{10}$/.test(phone)) {
      wx.showToast({ title: '手机号格式不正确', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '登录中' });
    try {
      const r = await cloud.call('login_phone', { phone });
      app.setOpenid(r.openid);
      app.setUser(r.user);
      wx.showToast({ title: '登录成功' });
      setTimeout(() => wx.navigateBack(), 400);
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  getProfile() {
    wx.getUserProfile({
      desc: '用于展示昵称与头像',
      success: async (res) => {
        const d = res.userInfo;
        wx.showLoading({ title: '同步中' });
        try {
          const r = await cloud.call('login_wechat', {
            nickName: d.nickName,
            avatarUrl: d.avatarUrl
          });
          app.setOpenid(r.openid);
          app.setUser(r.user);
          wx.showToast({ title: '已同步' });
        } catch (err) {
          wx.showToast({ title: err.message || '失败', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      },
      fail: () => {
        wx.showToast({ title: '未授权', icon: 'none' });
      }
    });
  }
});
