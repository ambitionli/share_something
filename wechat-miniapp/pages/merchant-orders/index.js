const appService = require('../../services/appService');

Page({
  data: {
    activeTab: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending_accept', label: '待接单' },
      { key: 'delivering', label: '配送中' },
      { key: 'refund_requested', label: '退款申请' },
      { key: 'refunded', label: '已退款' }
    ],
    orders: []
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      this.setData({ orders: appService.getMerchantOrders(this.data.activeTab) });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  changeTab(event) {
    this.setData({ activeTab: event.currentTarget.dataset.tab }, () => this.loadData());
  },
  handleAction(event) {
    const action = event.currentTarget.dataset.action;
    const orderId = event.currentTarget.dataset.id;
    try {
      if (action === 'accept') {
        appService.acceptOrder(orderId);
      } else if (action === 'reject') {
        appService.rejectOrder(orderId, '商家拒单并原路退款');
      } else if (action === 'deliver') {
        appService.markDelivering(orderId, '演示骑手');
      } else if (action === 'approveRefund') {
        appService.handleRefund(orderId, true, '商家已同意退款');
      } else if (action === 'rejectRefund') {
        appService.handleRefund(orderId, false, '商家驳回退款申请');
      }
      this.loadData();
      wx.showToast({ title: '处理成功', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
