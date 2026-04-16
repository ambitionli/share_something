const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    active: '',
    tabs: [
      { key: '', label: '全部' },
      { key: 'pending_pay', label: '待支付' },
      { key: 'pending_accept', label: '待接单' },
      { key: 'delivering', label: '配送中' },
      { key: 'completed', label: '已完成' },
      { key: 'refunding', label: '退款' }
    ],
    orders: []
  },

  onShow() {
    if (!auth.requireLogin()) {
      return;
    }
    this.load();
  },

  onTab(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ active: key });
    this.load();
  },

  fmtTime(t) {
    if (!t) {
      return '';
    }
    const d = new Date(t);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    const p = (n) => (n < 10 ? '0' + n : '' + n);
    return (
      d.getFullYear() +
      '-' +
      p(d.getMonth() + 1) +
      '-' +
      p(d.getDate()) +
      ' ' +
      p(d.getHours()) +
      ':' +
      p(d.getMinutes())
    );
  },

  async load() {
    wx.showNavigationBarLoading();
    try {
      const raw = await cloud.call('order_list', {
        status: this.data.active || undefined
      });
      const orders = (raw || []).map((o) => ({
        ...o,
        statusText: fmt.orderStatusText(o.status),
        amountYuan: fmt.money((o.amountCents || 0) / 100),
        timeText: this.fmtTime(o.createdAt)
      }));
      this.setData({ orders });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  openDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/order-detail/order-detail?id=' + encodeURIComponent(id)
    });
  },

  noop() {},

  async pay(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '支付中' });
    try {
      await cloud.call('order_pay', { orderId: id });
      wx.showToast({ title: '支付成功' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async cancel(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中' });
    try {
      await cloud.call('order_cancel', { orderId: id });
      wx.showToast({ title: '已取消' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async refund(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '提交中' });
    try {
      await cloud.call('order_refund_request', { orderId: id });
      wx.showToast({ title: '已申请退款' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  goReview(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/review/review?orderId=' + encodeURIComponent(id)
    });
  }
});
