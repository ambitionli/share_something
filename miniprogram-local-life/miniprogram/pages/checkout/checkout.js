const cloud = require('../../utils/cloud.js');
const cartUtil = require('../../utils/cart.js');
const auth = require('../../utils/auth.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    merchantId: '',
    merchant: null,
    products: [],
    lines: [],
    address: null,
    total: '0.00'
  },

  onLoad(q) {
    const id = q.merchantId ? decodeURIComponent(q.merchantId) : '';
    this.setData({ merchantId: id });
  },

  onShow() {
    if (!auth.requireLogin()) {
      return;
    }
    this.reload();
  },

  async reload() {
    wx.showNavigationBarLoading();
    try {
      let forcedAddr = null;
      try {
        const raw = wx.getStorageSync('checkout_pick_address');
        if (raw) {
          forcedAddr = typeof raw === 'string' ? JSON.parse(raw) : raw;
          wx.removeStorageSync('checkout_pick_address');
        }
      } catch (e) {
        console.warn('checkout_pick_address', e);
      }
      const m = await cloud.call('merchant_detail', {
        merchantId: this.data.merchantId
      });
      const products = await cloud.call('product_list', {
        merchantId: this.data.merchantId
      });
      const addrs = await cloud.call('address_list', {});
      const def =
        forcedAddr ||
        (addrs || []).find((a) => a.isDefault) ||
        (addrs || [])[0] ||
        null;
      const b = cartUtil.getBucket(this.data.merchantId);
      const pmap = {};
      for (const p of products) {
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
        const subline = Number(p.price) * q;
        sub += subline;
        lines.push({
          productId: pid,
          name: p.name,
          price: p.price,
          qty: q,
          sub: fmt.money(subline)
        });
      }
      const total = sub + Number(m.deliveryFee);
      this.setData({
        merchant: m,
        products,
        address: def,
        lines,
        total: fmt.money(total)
      });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  pickAddress() {
    wx.navigateTo({ url: '/pages/addresses/addresses?pick=1' });
  },

  async submit() {
    if (!this.data.address) {
      wx.showToast({ title: '请选择地址', icon: 'none' });
      return;
    }
    const b = cartUtil.getBucket(this.data.merchantId);
    const items = Object.keys(b.items).map((k) => ({
      productId: k,
      qty: b.items[k]
    }));
    if (!items.length) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '处理中' });
    try {
      const addr = {
        name: this.data.address.name,
        phone: this.data.address.phone,
        region: this.data.address.region,
        detail: this.data.address.detail
      };
      const cr = await cloud.call('order_create', {
        merchantId: this.data.merchantId,
        items,
        remark: b.remark || '',
        address: addr
      });
      await cloud.call('order_pay', { orderId: cr.orderId });
      cartUtil.clearMerchant(this.data.merchantId);
      wx.showToast({ title: '支付成功' });
      setTimeout(() => {
        wx.redirectTo({
          url:
            '/pages/order-detail/order-detail?id=' +
            encodeURIComponent(cr.orderId)
        });
      }, 400);
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
