const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function decorateDetail(detail) {
  const safeAddress = detail.order.address || {};
  return {
    ...detail,
    order: {
      ...detail.order,
      safeAddress,
      canPay: detail.order.actionKeys.includes('pay'),
      canRefund: detail.order.actionKeys.includes('refund'),
      canComplete: detail.order.actionKeys.includes('complete'),
      canReview: detail.order.actionKeys.includes('review'),
    },
  };
}

Page({
  data: {
    orderId: '',
    detail: null,
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId || '' });
    setTitle('订单详情');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const detail = service.getOrderDetail(this.data.orderId);
      this.setData({ detail: decorateDetail(detail) });
    } catch (error) {
      showError(error);
    }
  },

  async payOrder() {
    try {
      await service.payOrder({ orderId: this.data.orderId, paymentMethod: 'wechat' });
      showSuccess('支付成功');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async refundOrder() {
    try {
      await service.requestRefund({ orderId: this.data.orderId, reason: '从详情页申请退款' });
      showSuccess('退款申请已提交');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async completeOrder() {
    try {
      await service.completeOrder({ orderId: this.data.orderId });
      showSuccess('订单已完成');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  reviewOrder() {
    wx.navigateTo({ url: `/pages/review/index?orderId=${this.data.orderId}` });
  },
});
