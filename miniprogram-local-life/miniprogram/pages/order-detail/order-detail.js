const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    id: '',
    order: null,
    statusText: '',
    amountYuan: '0.00'
  },

  onLoad(q) {
    this.setData({ id: q.id ? decodeURIComponent(q.id) : '' });
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
      const o = await cloud.call('order_detail', { orderId: this.data.id });
      const items = (o.items || []).map((it) => ({
        ...it,
        lineYuan: fmt.money(Number(it.price) * it.qty)
      }));
      const order = { ...o, items };
      this.setData({
        order,
        statusText: fmt.orderStatusText(o.status),
        amountYuan: fmt.money((o.amountCents || 0) / 100)
      });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  async pay() {
    wx.showLoading({ title: '支付中' });
    try {
      await cloud.call('order_pay', { orderId: this.data.id });
      wx.showToast({ title: '支付成功' });
      this.load();
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async cancel() {
    wx.showLoading({ title: '处理中' });
    try {
      await cloud.call('order_cancel', { orderId: this.data.id });
      wx.showToast({ title: '已取消' });
      this.load();
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async refund() {
    wx.showLoading({ title: '提交中' });
    try {
      await cloud.call('order_refund_request', { orderId: this.data.id });
      wx.showToast({ title: '已申请退款' });
      this.load();
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  goReview() {
    wx.navigateTo({
      url:
        '/pages/review/review?orderId=' + encodeURIComponent(this.data.id)
    });
  }
});
