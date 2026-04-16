const service = require('../../services/app-service');
const { setTitle, showError } = require('../../utils/page');

function decorateDashboard(dashboard) {
  return {
    ...dashboard,
    statusText: dashboard.merchant.status === 'approved' ? '已通过审核' : '待审核',
  };
}

Page({
  data: {
    dashboard: null,
  },

  onLoad() {
    setTitle('商家工作台');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      this.setData({ dashboard: decorateDashboard(service.getMerchantDashboard()) });
    } catch (error) {
      showError(error);
    }
  },

  goProducts() {
    wx.navigateTo({ url: '/pages/merchant-products/index' });
  },

  goOrders() {
    wx.navigateTo({ url: '/pages/merchant-orders/index' });
  },

  goApply() {
    wx.navigateTo({ url: '/pages/merchant-apply/index' });
  },
});
