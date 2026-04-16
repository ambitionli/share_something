const store = require("../../utils/store");
const { ORDER_STATUS } = require("../../shared/core");

const tabs = [
  { label: "全部", value: "" },
  { label: "待支付", value: ORDER_STATUS.PENDING_PAYMENT },
  { label: "待接单", value: ORDER_STATUS.PENDING_ACCEPT },
  { label: "配送中", value: ORDER_STATUS.DELIVERING },
  { label: "已完成", value: ORDER_STATUS.COMPLETED },
  { label: "退款", value: ORDER_STATUS.REFUNDED }
];

Page({
  data: {
    tabs,
    activeStatus: "",
    orders: []
  },

  onShow() {
    this.loadOrders();
  },

  loadOrders() {
    const orders = store.listOrders(this.data.activeStatus);
    this.setData({ orders });
  },

  selectTab(event) {
    this.setData({ activeStatus: event.currentTarget.dataset.status });
    this.loadOrders();
  },

  payOrder(event) {
    try {
      store.payOrder(event.currentTarget.dataset.id);
      wx.showToast({ title: "支付成功", icon: "success" });
      this.loadOrders();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  cancelUnpaid(event) {
    try {
      store.cancelUnpaidOrder(event.currentTarget.dataset.id);
      wx.showToast({ title: "订单已取消", icon: "success" });
      this.loadOrders();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  refundOrder(event) {
    try {
      store.requestRefund(event.currentTarget.dataset.id, "用户主动申请退款");
      wx.showToast({ title: "退款申请已提交", icon: "success" });
      this.loadOrders();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  completeOrder(event) {
    try {
      store.completeOrder(event.currentTarget.dataset.id);
      wx.showToast({ title: "订单已完成", icon: "success" });
      this.loadOrders();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  reviewOrder(event) {
    wx.navigateTo({
      url: `/pages/review/index?orderId=${event.currentTarget.dataset.id}`
    });
  }
});
