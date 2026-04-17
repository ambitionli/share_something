const api = require("../../utils/api");
const { showToast, withLoading } = require("../../utils/helpers");

Page({
  data: {
    orderId: "",
    order: null
  },

  onLoad(options) {
    this.setData({
      orderId: options.id
    });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    this.setData({
      order: api.getOrderDetail(this.data.orderId)
    });
  },

  payOrder() {
    withLoading("支付中", () => {
      api.payOrder(this.data.orderId);
      this.loadData();
    }).catch((error) => {
      showToast(error.message);
    });
  },

  requestRefund() {
    withLoading("提交中", () => {
      api.requestRefund(this.data.orderId, "临时有事，申请退款");
      this.loadData();
    }).catch((error) => {
      showToast(error.message);
    });
  },

  confirmOrder() {
    withLoading("确认中", () => {
      api.confirmOrder(this.data.orderId);
      this.loadData();
    }).catch((error) => {
      showToast(error.message);
    });
  },

  goReview() {
    wx.navigateTo({
      url: `/pages/review/index?orderId=${this.data.orderId}`
    });
  }
});
