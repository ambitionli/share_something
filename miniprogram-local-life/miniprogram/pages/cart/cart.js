const cloud = require('../../utils/cloud.js');
const cartUtil = require('../../utils/cart.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    merchantId: '',
    merchant: null,
    products: [],
    lines: [],
    remark: '',
    subtotal: '0.00',
    total: '0.00'
  },

  onLoad(q) {
    const id = q.merchantId ? decodeURIComponent(q.merchantId) : '';
    this.setData({ merchantId: id });
  },

  onShow() {
    this.reload();
  },

  onRemark(e) {
    const v = e.detail.value;
    this.setData({ remark: v });
    cartUtil.setRemark(this.data.merchantId, v);
  },

  async reload() {
    if (!this.data.merchantId) {
      return;
    }
    wx.showNavigationBarLoading();
    try {
      const m = await cloud.call('merchant_detail', {
        merchantId: this.data.merchantId
      });
      const products = await cloud.call('product_list', {
        merchantId: this.data.merchantId
      });
      const b = cartUtil.getBucket(this.data.merchantId);
      this.setData({
        merchant: m,
        products,
        remark: b.remark || ''
      });
      this.rebuildLines();
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  rebuildLines() {
    const b = cartUtil.getBucket(this.data.merchantId);
    const pmap = {};
    for (const p of this.data.products) {
      pmap[p._id] = p;
    }
    const lines = [];
    let sub = 0;
    for (const pid of Object.keys(b.items)) {
      const q = b.items[pid];
      const p = pmap[pid];
      if (!p || q <= 0) {
        continue;
      }
      lines.push({
        productId: pid,
        name: p.name,
        price: p.price,
        qty: q
      });
      sub += Number(p.price) * q;
    }
    const delivery = this.data.merchant
      ? Number(this.data.merchant.deliveryFee)
      : 0;
    const total = sub + delivery;
    this.setData({
      lines,
      subtotal: fmt.money(sub),
      total: fmt.money(total)
    });
  },

  inc(e) {
    const id = e.currentTarget.dataset.id;
    const cur = cartUtil.getBucket(this.data.merchantId).items[id] || 0;
    cartUtil.setQty(this.data.merchantId, id, cur + 1);
    this.rebuildLines();
  },

  dec(e) {
    const id = e.currentTarget.dataset.id;
    const cur = cartUtil.getBucket(this.data.merchantId).items[id] || 0;
    cartUtil.setQty(this.data.merchantId, id, cur - 1);
    this.rebuildLines();
  },

  checkout() {
    if (!this.data.lines.length) {
      return;
    }
    wx.navigateTo({
      url:
        '/pages/checkout/checkout?merchantId=' +
        encodeURIComponent(this.data.merchantId)
    });
  }
});
