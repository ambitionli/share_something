App({
  globalData: {
    appName: "邻里即达",
    mockMode: true,
    cloudEnvId: "",
    sessionKey: "delivery-miniapp-session",
    dbKey: "delivery-miniapp-db-v1",
    currentUser: null,
    checkoutDraft: null,
    reviewDraft: null
  },

  onLaunch() {
    this.restoreSession();
  },

  restoreSession() {
    const session = wx.getStorageSync(this.globalData.sessionKey) || null;
    this.globalData.currentUser = session;
  },

  setCurrentUser(user) {
    this.globalData.currentUser = user;
    wx.setStorageSync(this.globalData.sessionKey, user);
  },

  clearCurrentUser() {
    this.globalData.currentUser = null;
    wx.removeStorageSync(this.globalData.sessionKey);
  }
});
