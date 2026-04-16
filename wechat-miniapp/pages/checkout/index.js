const store = require("../../utils/store");
const format = require("../../utils/format");

Page({
  data: {
    cart: null,
    addresses: [],
    selectedAddressId: "",
    remark: "",
    coupons: [],
    couponIndex: 0,
    payableTotalText: "0.00",
    discountText: "0.00"
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const cart = store.getCart();
    const addresses = store.listAddresses();
    const profile = store.getProfile();
    const coupons = [{ id: "", title: "不使用优惠券", amount: 0, threshold: 0 }].concat(
      profile.coupons.filter((item) => !item.used)
    );
    const selectedAddress = addresses.find((item) => item.isDefault) || addresses[0];

    this.setData({
      cart: {
        ...cart,
        subtotalText: format.price(cart.subtotal),
        totalText: format.price(cart.total)
      },
      addresses,
      selectedAddressId: selectedAddress ? selectedAddress.id : "",
      coupons,
      couponIndex: 0
    });
    this.refreshPayableTotal(0);
  },

  handleRemarkInput(event) {
    this.setData({ remark: event.detail.value });
  },

  chooseAddress(event) {
    this.setData({ selectedAddressId: event.currentTarget.dataset.id });
  },

  chooseCoupon(event) {
    const couponIndex = Number(event.detail.value);
    this.setData({ couponIndex });
    this.refreshPayableTotal(couponIndex);
  },

  goAddressPage() {
    wx.navigateTo({ url: "/pages/address/index?from=checkout" });
  },

  submitOrder() {
    if (!this.data.selectedAddressId) {
      wx.showToast({ title: "请先选择地址", icon: "none" });
      return;
    }

    try {
      const coupon = this.data.coupons[this.data.couponIndex] || { id: "" };
      const order = store.createOrder(
        this.data.selectedAddressId,
        this.data.remark,
        coupon.id
      );

      wx.showModal({
        title: "订单创建成功",
        content: "是否立即模拟支付？",
        success: (result) => {
          if (result.confirm) {
            store.payOrder(order.id);
            wx.showToast({ title: "支付成功", icon: "success" });
          }
          wx.switchTab({ url: "/pages/orders/index" });
        }
      });
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  }

  ,

  refreshPayableTotal(couponIndex) {
    const cart = this.data.cart;
    if (!cart) {
      return;
    }
    const coupon = this.data.coupons[couponIndex] || { amount: 0, threshold: 0 };
    const discountAmount = cart.subtotal >= coupon.threshold ? coupon.amount : 0;
    const payableTotal = Math.max(0, cart.total - discountAmount);
    this.setData({
      payableTotalText: format.price(payableTotal),
      discountText: format.price(discountAmount)
    });
  }
});
