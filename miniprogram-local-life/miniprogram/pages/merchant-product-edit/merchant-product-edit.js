const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    merchantId: '',
    productId: '',
    name: '',
    price: '',
    stock: '',
    statuses: [
      { key: 'on_shelf', label: '上架' },
      { key: 'off_shelf', label: '下架' }
    ],
    statusIndex: 0
  },

  onLoad(q) {
    this.setData({
      merchantId: q.merchantId ? decodeURIComponent(q.merchantId) : '',
      productId: q.productId ? decodeURIComponent(q.productId) : ''
    });
    if (this.data.productId) {
      this.loadOne();
    }
  },

  onShow() {
    auth.requireLogin();
  },

  async loadOne() {
    wx.showLoading({ title: '加载中' });
    try {
      const list = await cloud.call('product_list', {
        merchantId: this.data.merchantId
      });
      const p = (list || []).find((x) => x._id === this.data.productId);
      if (p) {
        const idx = p.status === 'off_shelf' ? 1 : 0;
        this.setData({
          name: p.name,
          price: String(p.price),
          stock: String(p.stock),
          statusIndex: idx
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
  onPrice(e) {
    this.setData({ price: e.detail.value });
  },
  onStock(e) {
    this.setData({ stock: e.detail.value });
  },
  onStatus(e) {
    this.setData({ statusIndex: Number(e.detail.value) });
  },

  async save() {
    wx.showLoading({ title: '保存中' });
    try {
      const st = this.data.statuses[this.data.statusIndex].key;
      await cloud.call('merchant_product_upsert', {
        merchantId: this.data.merchantId,
        productId: this.data.productId || undefined,
        name: this.data.name,
        price: Number(this.data.price),
        stock: Number(this.data.stock),
        status: st
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
