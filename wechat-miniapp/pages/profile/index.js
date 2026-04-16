const store = require("../../utils/store");

Page({
  data: {
    profile: null,
    settings: {
      notifications: true,
      darkMode: false
    }
  },

  onShow() {
    const profile = store.getProfile();
    this.setData({
      profile,
      settings: profile.settings
    });
  },

  goAddress() {
    wx.navigateTo({ url: "/pages/address/index" });
  },

  goOrders() {
    wx.switchTab({ url: "/pages/orders/index" });
  },

  goMerchantCenter() {
    wx.navigateTo({ url: "/pages/merchantCenter/index" });
  },

  callService() {
    const profile = this.data.profile;
    wx.showModal({
      title: "联系客服",
      content: `客服电话：${profile.support.supportPhone}\n客服微信：${profile.support.supportWeChat}`,
      showCancel: false
    });
  },

  resetDemo() {
    store.resetAll();
    const profile = store.getProfile();
    this.setData({
      profile,
      settings: profile.settings
    });
    wx.showToast({ title: "已恢复演示数据", icon: "success" });
  },

  toggleNotifications(event) {
    const value = !this.data.settings.notifications;
    const settings = store.updateSettings({ notifications: value });
    this.setData({
      "settings.notifications": settings.notifications,
      "profile.settings.notifications": settings.notifications
    });
  },

  toggleDarkMode(event) {
    const value = !this.data.settings.darkMode;
    const settings = store.updateSettings({ darkMode: value });
    this.setData({
      "settings.darkMode": settings.darkMode,
      "profile.settings.darkMode": settings.darkMode
    });
  },

  goLogin() {
    wx.navigateTo({ url: "/pages/login/index" });
  }
});
