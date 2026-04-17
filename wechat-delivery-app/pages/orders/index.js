const api = require("../../utils/api");
const { showToast, withLoading } = require("../../utils/helpers");

Page({
  data: {
    tabs: [],
    activeTab: "全部",
    orders: []
  },

  onShow() {
    this.setData({
      tabs: api.getStatusGroups()
    });
    this.loadOrders();
  },

  loadOrders() {
    this.setData({
      orders: api.listOrders(this.data.activeTab)
    });
  },

  switchTab(event) {
    this.setData({
      activeTab: event.currentTarget.dataset.tab
    });
    this.loadOrders();
  },

  openDetail(event) {
    wx.navigateTo({
      url: `/pages/order-detail/index?id=${event.currentTarget.dataset.id}`
    });
  },

  payOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    withLoading("支付中", () => {
      api.payOrder(orderId);
      this.loadOrders();
    }).catch((error) => {
      showToast(error.message);
    });
  }
});
