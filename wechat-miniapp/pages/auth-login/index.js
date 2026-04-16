const api = require("../../services/api");

Page({
  data: {
    phone: "13800000000",
    code: "123456",
    loading: false
  },

  onShow() {
    const user = api.getCurrentUser();
    if (user && user.id) {
      wx.switchTab({
        url: "/pages/home/index"
      });
    }
  },

  onPhoneInput(event) {
    this.setData({
      phone: event.detail.value
    });
  },

  onCodeInput(event) {
    this.setData({
      code: event.detail.value
    });
  },

  useBuyerDemo() {
    this.setData({
      phone: "13800000000",
      code: "123456"
    });
  },

  useMerchantDemo() {
    this.setData({
      phone: "13900000000",
      code: "123456"
    });
  },

  async handlePhoneLogin() {
    if (this.data.loading) {
      return;
    }

    this.setData({ loading: true });
    try {
      await api.loginWithPhone(this.data.phone, this.data.code);
      wx.showToast({
        title: "登录成功",
        icon: "success"
      });
      wx.switchTab({
        url: "/pages/home/index"
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async handleWechatLogin() {
    if (this.data.loading) {
      return;
    }

    this.setData({ loading: true });
    try {
      await api.loginWithWechat();
      wx.showToast({
        title: "微信授权成功",
        icon: "success"
      });
      wx.switchTab({
        url: "/pages/home/index"
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  async resetDemoData() {
    await api.resetDemoData();
    wx.showToast({
      title: "演示数据已重置",
      icon: "none"
    });
    wx.switchTab({
      url: "/pages/home/index"
    });
  }
});
