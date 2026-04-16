const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function buildTabs(currentTab) {
  return service.getOrderTabs().map((item) => ({
    ...item,
    activeClass: currentTab === item.id ? 'tab-item-active' : '',
  }));
}

function buildOrders(orders) {
  return orders.map((item) => ({
    ...item,
    canPay: item.actionKeys.includes('pay'),
    canRefund: item.actionKeys.includes('refund'),
    canComplete: item.actionKeys.includes('complete'),
    canReview: item.actionKeys.includes('review'),
  }));
}

Page({
  data: {
    tabs: [],
    currentTab: 'all',
    orders: [],
  },

  onLoad() {
    setTitle('我的订单');
    this.setData({ tabs: buildTabs('all') });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const orders = service.listOrders(this.data.currentTab);
      this.setData({
        tabs: buildTabs(this.data.currentTab),
        orders: buildOrders(orders),
      });
    } catch (error) {
      showError(error);
    }
  },

  selectTab(event) {
    this.setData({ currentTab: event.currentTarget.dataset.id });
    this.refresh();
  },

  openDetail(event) {
    wx.navigateTo({ url: `/pages/order-detail/index?orderId=${event.currentTarget.dataset.id}` });
  },

  async payOrder(event) {
    try {
      await service.payOrder({ orderId: event.currentTarget.dataset.id, paymentMethod: 'wechat' });
      showSuccess('支付成功');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async completeOrder(event) {
    try {
      await service.completeOrder({ orderId: event.currentTarget.dataset.id });
      showSuccess('订单已完成');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async refundOrder(event) {
    try {
      await service.requestRefund({ orderId: event.currentTarget.dataset.id, reason: '用户从订单列表发起退款' });
      showSuccess('退款申请已提交');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  reviewOrder(event) {
    wx.navigateTo({ url: `/pages/review/index?orderId=${event.currentTarget.dataset.id}` });
  },
});
