const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function buildFilters(currentFilter) {
  return [
    { id: 'all', name: '全部' },
    { id: 'pending_accept', name: '待接单' },
    { id: 'delivering', name: '配送中' },
    { id: 'refund', name: '退款' },
  ].map((item) => ({
    ...item,
    activeClass: currentFilter === item.id ? 'tab-item-active' : '',
  }));
}

function buildOrders(orders) {
  return orders.map((item) => ({
    ...item,
    canAccept: item.status === 'pending_accept',
    canReject: item.status === 'pending_accept' || item.status === 'accepted',
    canDeliver: item.status === 'accepted',
    canRefundProcess: item.status === 'refunding',
  }));
}

Page({
  data: {
    filters: buildFilters('all'),
    currentFilter: 'all',
    orders: [],
  },

  onLoad() {
    setTitle('商家订单');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      this.setData({
        filters: buildFilters(this.data.currentFilter),
        orders: buildOrders(service.listMerchantOrders(this.data.currentFilter)),
      });
    } catch (error) {
      showError(error);
    }
  },

  selectFilter(event) {
    this.setData({ currentFilter: event.currentTarget.dataset.id });
    this.refresh();
  },

  async accept(event) {
    try {
      await service.merchantHandleOrder({ orderId: event.currentTarget.dataset.id, action: 'accept' });
      showSuccess('已接单');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async deliver(event) {
    try {
      await service.merchantHandleOrder({ orderId: event.currentTarget.dataset.id, action: 'deliver', courierName: '配送员阿峰', courierPhone: '18866668888' });
      showSuccess('已标记配送');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async refund(event) {
    try {
      await service.merchantHandleOrder({ orderId: event.currentTarget.dataset.id, action: 'process_refund', note: '商家端处理完成' });
      showSuccess('退款已处理');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async reject(event) {
    try {
      await service.merchantHandleOrder({ orderId: event.currentTarget.dataset.id, action: 'reject', reason: '超出配送能力，自动退款' });
      showSuccess('已拒单并退款');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },
});
