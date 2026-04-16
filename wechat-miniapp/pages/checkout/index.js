const api = require("../../services/api");
const { formatMoney, buildSubmitToken } = require("../../utils/format");

function decorateSummary(summary) {
  if (!summary) {
    return null;
  }

  return Object.assign({}, summary, {
    goodsAmountDisplay: formatMoney(summary.goodsAmount),
    deliveryFeeDisplay: formatMoney(summary.deliveryFee),
    payableAmountDisplay: formatMoney(summary.payableAmount),
    items: (summary.items || []).map((item) =>
      Object.assign({}, item, {
        priceDisplay: formatMoney(item.price),
        subtotalDisplay: formatMoney(item.subtotal)
      })
    )
  });
}

Page({
  data: {
    merchantId: "",
    merchant: null,
    user: null,
    selectedAddressId: "",
    addressList: [],
    remark: "",
    couponCode: "",
    summary: null,
    loading: true,
    submitting: false
  },

  onLoad(options) {
    this.setData({
      merchantId: (options && options.merchantId) || ""
    });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const app = getApp();
    const user = api.getCurrentUser();
    const summary = api.getCheckoutSummary(this.data.merchantId);
    const addressList = user ? api.listAddresses() : [];
    const defaultAddress =
      addressList.find((address) => address.isDefault) || addressList[0] || null;
    const merchant = summary ? api.getMerchantById(summary.merchantId) : null;

    this.setData({
      merchant,
      user,
      summary: decorateSummary(summary),
      addressList,
      selectedAddressId: defaultAddress ? defaultAddress.id : "",
      loading: false,
      couponCode: app.globalData.checkoutDraft ? app.globalData.checkoutDraft.couponCode : "",
      remark: app.globalData.checkoutDraft ? app.globalData.checkoutDraft.remark : ""
    });
  },

  onRemarkInput(event) {
    const remark = event.detail.value;
    this.setData({ remark });
    getApp().globalData.checkoutDraft = {
      ...(getApp().globalData.checkoutDraft || {}),
      remark,
      couponCode: this.data.couponCode
    };
  },

  onCouponInput(event) {
    const couponCode = event.detail.value;
    this.setData({ couponCode });
    getApp().globalData.checkoutDraft = {
      ...(getApp().globalData.checkoutDraft || {}),
      remark: this.data.remark,
      couponCode
    };
  },

  onAddressChange(event) {
    this.setData({
      selectedAddressId: event.detail.value
    });
  },

  async addAddress() {
    const user = api.getCurrentUser();
    if (!user) {
      wx.showToast({
        title: "请先登录",
        icon: "none"
      });
      return;
    }

    const count = this.data.addressList.length + 1;
    await api.addAddress({
      name: `新地址${count}`,
      phone: user.phone || "13800000000",
      city: "北京市朝阳区",
      detail: `测试大道 ${count} 号`,
      tag: "新增",
      isDefault: count === 1
    });
    this.loadData();
  },

  async submitOrder() {
    if (this.data.submitting) {
      return;
    }
    if (!this.data.summary) {
      wx.showToast({
        title: "购物车为空",
        icon: "none"
      });
      return;
    }
    if (!this.data.selectedAddressId) {
      wx.showToast({
        title: "请选择地址",
        icon: "none"
      });
      return;
    }

    this.setData({ submitting: true });
    try {
      const result = await api.placeOrder({
        merchantId: this.data.summary.merchantId,
        addressId: this.data.selectedAddressId,
        remark: this.data.remark,
        couponCode: this.data.couponCode,
        submitToken: buildSubmitToken()
      });
      const order = result.order || result;
      wx.showToast({
        title: "订单已创建",
        icon: "success"
      });
      getApp().globalData.checkoutDraft = null;
      wx.redirectTo({
        url: `/pages/orders/index?focusId=${order.id}`
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    } finally {
      this.setData({ submitting: false });
    }
  }
});
