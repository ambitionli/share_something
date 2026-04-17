const api = require("../../utils/api");
const { generateClientToken, showToast, withLoading } = require("../../utils/helpers");

Page({
  data: {
    merchantId: "",
    merchant: null,
    cart: [],
    address: null,
    summary: null,
    availableCoupons: [],
    selectedCouponId: "",
    remark: ""
  },

  onLoad(options) {
    this.setData({
      merchantId: options.merchantId
    });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const data = api.getCheckoutData(this.data.merchantId, this.data.selectedCouponId || undefined);
    if (this.data.address) {
      data.address = this.data.address;
    }
    this.setData(data);
  },

  onSelectedAddress(address) {
    this.setData({
      address
    });
  },

  onRemarkInput(event) {
    this.setData({
      remark: event.detail.value
    });
  },

  chooseCoupon(event) {
    const couponId = event.currentTarget.dataset.id || "";
    this.setData({
      selectedCouponId: this.data.selectedCouponId === couponId ? "" : couponId
    });
    this.loadData();
  },

  goChooseAddress() {
    wx.navigateTo({
      url: "/pages/addresses/index?mode=select"
    });
  },

  submitOrder(event) {
    const payAfterCreate = Boolean(event.currentTarget.dataset.pay);
    if (!this.data.address) {
      showToast("请先选择收货地址");
      return;
    }

    withLoading(payAfterCreate ? "支付中" : "创建订单中", () => {
      const order = api.createOrder({
        merchantId: this.data.merchantId,
        addressId: this.data.address.id,
        remark: this.data.remark,
        couponId: this.data.selectedCouponId || undefined,
        clientToken: generateClientToken()
      });

      if (payAfterCreate) {
        api.payOrder(order.id);
      }

      wx.redirectTo({
        url: `/pages/order-detail/index?id=${order.id}`
      });
    }).catch((error) => {
      showToast(error.message);
    });
  }
});
