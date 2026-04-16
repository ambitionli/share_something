const appService = require('../../services/appService');

Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending_payment', label: '待支付' },
      { key: 'pending_accept', label: '待接单' },
      { key: 'delivering', label: '配送中' },
      { key: 'completed', label: '已完成' },
      { key: 'refunded', label: '退款' }
    ],
    orders: []
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      this.setData({ orders: appService.getUserOrders(this.data.activeTab) });
    } catch (error) {
      wx.navigateTo({ url: '/pages/login/index' });
    }
  },
  changeTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab }, () => this.loadData());
  },
  handleAction(event) {
    const action = event.currentTarget.dataset.action;
    const orderId = event.currentTarget.dataset.id;
    try {
      if (action === 'pay') {
        appService.payOrder(orderId);
      } else if (action === 'refund') {
        appService.requestRefund(orderId, '用户发起退款');
      } else if (action === 'confirm') {
        appService.confirmOrder(orderId);
      } else if (action === 'review') {
        wx.navigateTo({ url: '/pages/review/index?orderId=' + orderId });
        return;
      } else if (action === 'cancel') {
        appService.cancelOrder(orderId);
      }
      this.loadData();
      wx.showToast({ title: '操作成功', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
