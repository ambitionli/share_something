const api = require("../../services/api");
const { ORDER_FILTER_GROUPS } = require("../../shared/seed");
const { formatMoney, formatStatus } = require("../../utils/format");

const FILTERS = [
  { id: "all", label: "全部" },
  { id: "pending_payment", label: "待支付" },
  { id: "pending_accept", label: "待接单" },
  { id: "delivering", label: "配送中" },
  { id: "completed", label: "已完成" },
  { id: "refund", label: "退款/售后" }
];

function decorateOrder(order) {
  return Object.assign({}, order, {
    payableAmountDisplay: formatMoney(order.payableAmount),
    goodsAmountDisplay: formatMoney(order.goodsAmount),
    deliveryFeeDisplay: formatMoney(order.deliveryFee),
    statusLabel: formatStatus(order.status),
    statusClass: `status-${order.status}`
  });
}

Page({
  data: {
    user: null,
    filterTabs: FILTERS.map((item) => ({
      key: item.id,
      label: item.label
    })),
    currentFilter: "all",
    orders: [],
    focusId: "",
    loading: true
  },

  onLoad(options) {
    this.setData({
      currentFilter:
        options && ORDER_FILTER_GROUPS[options.filter]
          ? options.filter
          : "all",
      focusId: (options && options.focusId) || ""
    });
  },

  onShow() {
    this.loadOrders();
  },

  async loadOrders() {
    const user = api.getCurrentUser();
    this.setData({
      user,
      loading: true
    });

    if (!user) {
      this.setData({
        orders: [],
        loading: false
      });
      return;
    }

    try {
      const result = await api.listOrders(this.data.currentFilter);
      this.setData({
        orders: result.orders.map(decorateOrder),
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
      this.setData({
        loading: false
      });
    }
  },

  openLogin() {
    wx.navigateTo({
      url: "/pages/auth-login/index"
    });
  },

  openHome() {
    wx.switchTab({
      url: "/pages/home/index"
    });
  },

  switchFilter(event) {
    this.setData({
      currentFilter:
        event.currentTarget.dataset.filter ||
        event.currentTarget.dataset.key ||
        "all"
    });
    this.loadOrders();
  },

  async payOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    try {
      await api.payOrder(orderId);
      wx.showToast({
        title: "支付成功",
        icon: "success"
      });
      this.loadOrders();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async confirmOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    try {
      await api.confirmOrder(orderId);
      wx.showToast({
        title: "订单已完成",
        icon: "success"
      });
      this.loadOrders();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  refundOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ["配送慢了", "不想要了", "商品异常"],
      success: async (res) => {
        const reasons = ["配送慢了", "不想要了", "商品异常"];
        try {
          await api.requestRefund(orderId, reasons[res.tapIndex]);
          wx.showToast({
            title: "已提交退款",
            icon: "success"
          });
          this.loadOrders();
        } catch (error) {
          wx.showToast({
            title: error.message,
            icon: "none"
          });
        }
      }
    });
  },

  goReview(event) {
    const orderId = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/review/index?orderId=${orderId}`
    });
  },

  reviewOrder(event) {
    this.goReview(event);
  }
});
