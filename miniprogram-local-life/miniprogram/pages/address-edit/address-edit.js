const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    id: '',
    name: '',
    phone: '',
    region: '',
    detail: '',
    isDefault: true
  },

  onLoad(q) {
    const id = q.id ? decodeURIComponent(q.id) : '';
    this.setData({ id });
    if (id) {
      this.loadOne(id);
    }
  },

  onShow() {
    auth.requireLogin();
  },

  async loadOne(id) {
    wx.showLoading({ title: '加载中' });
    try {
      const list = await cloud.call('address_list', {});
      const one = (list || []).find((a) => a._id === id);
      if (one) {
        this.setData({
          name: one.name,
          phone: one.phone,
          region: one.region,
          detail: one.detail,
          isDefault: !!one.isDefault
        });
      }
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onName(e) {
    this.setData({ name: e.detail.value });
  },
  onPhone(e) {
    this.setData({ phone: e.detail.value });
  },
  onRegion(e) {
    this.setData({ region: e.detail.value });
  },
  onDetail(e) {
    this.setData({ detail: e.detail.value });
  },
  onDefault(e) {
    this.setData({ isDefault: e.detail.value });
  },

  async save() {
    wx.showLoading({ title: '保存中' });
    try {
      await cloud.call('address_save', {
        id: this.data.id || undefined,
        name: this.data.name,
        phone: this.data.phone,
        region: this.data.region,
        detail: this.data.detail,
        isDefault: this.data.isDefault
      });
      wx.showToast({ title: '已保存' });
      setTimeout(() => wx.navigateBack(), 400);
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
