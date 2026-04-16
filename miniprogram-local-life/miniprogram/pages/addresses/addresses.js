const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    pick: false,
    list: []
  },

  onLoad(q) {
    this.setData({ pick: q.pick === '1' || q.pick === 'true' });
  },

  onShow() {
    if (!auth.requireLogin()) {
      return;
    }
    this.load();
  },

  async load() {
    wx.showNavigationBarLoading();
    try {
      const list = await cloud.call('address_list', {});
      this.setData({ list: list || [] });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  noop() {},

  onPick(e) {
    if (!this.data.pick) {
      return;
    }
    const id = e.currentTarget.dataset.id;
    const item = (this.data.list || []).find((a) => a._id === id);
    if (!item) {
      return;
    }
    try {
      wx.setStorageSync('checkout_pick_address', JSON.stringify(item));
    } catch (err) {
      console.warn('set checkout_pick_address', err);
    }
    wx.navigateBack();
  },

  add() {
    wx.navigateTo({ url: '/pages/address-edit/address-edit' });
  },

  edit(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: '/pages/address-edit/address-edit?id=' + encodeURIComponent(id) });
  },

  async remove(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除地址？',
      success: async (r) => {
        if (!r.confirm) {
          return;
        }
        wx.showLoading({ title: '删除中' });
        try {
          await cloud.call('address_delete', { id });
          wx.showToast({ title: '已删除' });
          this.load();
        } catch (err) {
          wx.showToast({ title: err.message || '失败', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      }
    });
  }
});
