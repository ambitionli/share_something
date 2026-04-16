// app.js — 邻刻达本地生活
App({
  globalData: {
    user: null,
    openid: '',
    cart: {},
    /** @type {string|null} */
    merchantId: null
  },

  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用支持云开发的基础库');
      return;
    }
    wx.cloud.init({
      env: '', // 在开发者工具中关联云环境后自动注入；也可在此填写 envId
      traceUser: true
    });
    this.restoreSession();
    try {
      const { loadFromStorage } = require('./utils/cart.js');
      loadFromStorage();
    } catch (e) {
      console.warn('cart bootstrap', e);
    }
    this.bootstrapCloudSession();
  },

  bootstrapCloudSession() {
    wx.cloud
      .callFunction({
        name: 'lnk_api',
        data: { action: 'session' }
      })
      .then((res) => {
        const r = res.result;
        if (r && r.ok && r.data && r.data.openid) {
          this.setOpenid(r.data.openid);
          if (r.data.user) {
            this.setUser(r.data.user);
          }
        }
      })
      .catch((e) => {
        console.warn('bootstrapCloudSession', e);
      });
  },

  restoreSession() {
    try {
      const u = wx.getStorageSync('user');
      const oid = wx.getStorageSync('openid');
      const mid = wx.getStorageSync('merchantId');
      if (u) {
        this.globalData.user = u;
      }
      if (oid) {
        this.globalData.openid = oid;
      }
      if (mid) {
        this.globalData.merchantId = mid;
      }
    } catch (e) {
      console.warn('restoreSession', e);
    }
  },

  setUser(user) {
    this.globalData.user = user;
    try {
      wx.setStorageSync('user', user);
    } catch (e) {
      console.warn('setUser storage', e);
    }
  },

  setOpenid(openid) {
    this.globalData.openid = openid;
    try {
      wx.setStorageSync('openid', openid);
    } catch (e) {
      console.warn('setOpenid storage', e);
    }
  },

  setMerchantId(id) {
    this.globalData.merchantId = id;
    try {
      if (id) {
        wx.setStorageSync('merchantId', id);
      } else {
        wx.removeStorageSync('merchantId');
      }
    } catch (e) {
      console.warn('setMerchantId storage', e);
    }
  }
});
