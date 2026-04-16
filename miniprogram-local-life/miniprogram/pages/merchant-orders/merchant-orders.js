const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');
const fmt = require('../../utils/format.js');

Page({
  data: {
    active: '',
    tabs: [
      { key: '', label: '全部' },
      { key: 'pending_accept', label: '待接单' },
      { key: 'delivering', label: '配送' },
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
    this.setData({ active: e.currentTarget.dataset.key });
    this.load();
  },

  async load() {
    wx.showNavigationBarLoading();
    try {
      const raw = await cloud.call('merchant_orders', {
        status: this.data.active || undefined
      });
      const orders = (raw || []).map((o) => ({
        ...o,
        statusText: fmt.orderStatusText(o.status),
        amountYuan: fmt.money((o.amountCents || 0) / 100)
      }));
      this.setData({ orders });
    } catch (e) {
      wx.showToast({ title: e.message || '加载失败', icon: 'none' });
    } finally {
      wx.hideNavigationBarLoading();
    }
  },

  async accept(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中' });
    try {
      await cloud.call('merchant_order_accept', { orderId: id, accept: true });
      wx.showToast({ title: '已接单' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  reject(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '拒单将退回库存',
      editable: true,
      placeholderText: '拒单原因（选填）',
      success: async (r) => {
        if (!r.confirm) {
          return;
        }
        wx.showLoading({ title: '处理中' });
        try {
          await cloud.call('merchant_order_accept', {
            orderId: id,
            accept: false,
            reason: r.content || ''
          });
          wx.showToast({ title: '已拒单' });
          this.load();
        } catch (err) {
          wx.showToast({ title: err.message || '失败', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      }
    });
  },

  async deliver(e) {
    const id = e.currentTarget.dataset.id;
    wx.showLoading({ title: '处理中' });
    try {
      await cloud.call('merchant_order_deliver', { orderId: id });
      wx.showToast({ title: '已完成' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  async refund(e) {
    const id = e.currentTarget.dataset.id;
    const ok = e.currentTarget.dataset.ok === true || e.currentTarget.dataset.ok === 'true';
    wx.showLoading({ title: '处理中' });
    try {
      await cloud.call('merchant_refund_handle', { orderId: id, approve: ok });
      wx.showToast({ title: ok ? '已退款' : '已拒绝退款' });
      this.load();
    } catch (err) {
      wx.showToast({ title: err.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
