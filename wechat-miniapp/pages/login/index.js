const store = require("../../utils/store");

Page({
  data: {
    phone: "13800000001",
    nickname: "夜猫子",
    currentUser: null
  },

  onShow() {
    const currentUser = store.getCurrentUser();
    this.setData({ currentUser });
  },

  handlePhoneInput(event) {
    this.setData({ phone: event.detail.value });
  },

  handleNicknameInput(event) {
    this.setData({ nickname: event.detail.value });
  },

  loginByPhone() {
    try {
      const user = store.loginWithPhone(this.data.phone, this.data.nickname);
      getApp().globalData.currentUser = user;
      wx.showToast({ title: "手机号登录成功", icon: "success" });
      wx.switchTab({ url: "/pages/home/index" });
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  loginByWechat() {
    try {
      const user = store.loginWithWechat(this.data.nickname || "微信用户");
      getApp().globalData.currentUser = user;
      wx.showToast({ title: "微信授权成功", icon: "success" });
      wx.switchTab({ url: "/pages/home/index" });
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  resetDemo() {
    store.resetAll();
    const currentUser = store.getCurrentUser();
    getApp().globalData.currentUser = currentUser;
    this.setData({ currentUser });
    wx.showToast({ title: "已恢复演示数据", icon: "success" });
  }
});
