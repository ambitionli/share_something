const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

const ADDRESS_KEY = 'linli-jida-selected-address';
const COUPON_KEY = 'linli-jida-selected-coupon';

function buildPaymentMethods(selectedPaymentMethod) {
  return service.getPaymentMethods().map((item) => ({
    ...item,
    activeClass: selectedPaymentMethod === item.id ? 'payment-item-active' : '',
  }));
}

Page({
  data: {
    cart: { items: [] },
    addresses: [],
    coupons: [],
    selectedAddressId: '',
    selectedCouponId: '',
    couponActionText: '去选择',
    preview: null,
    previewAddress: null,
    hasPreviewAddress: false,
    paymentMethods: [],
    selectedPaymentMethod: 'wechat',
    remark: '',
  },

  onLoad() {
    setTitle('结算');
    this.setData({ paymentMethods: buildPaymentMethods('wechat') });
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const cart = service.getCart();
      const addresses = service.listAddresses();
      const coupons = service.listCoupons();
      const selectedAddressId = wx.getStorageSync(ADDRESS_KEY) || (addresses.find((item) => item.isDefault) || {}).id || '';
      const selectedCouponId = wx.getStorageSync(COUPON_KEY) || '';
      let preview = null;
      if (cart.items.length && selectedAddressId) {
        preview = service.getCheckoutPreview({ addressId: selectedAddressId, couponId: selectedCouponId });
      }
      this.setData({
        cart,
        addresses,
        coupons,
        selectedAddressId,
        selectedCouponId,
        couponActionText: selectedCouponId ? '已选择' : '去选择',
        preview,
        previewAddress: preview ? preview.address : null,
        hasPreviewAddress: Boolean(preview && preview.address),
        remark: cart.remark || '',
        paymentMethods: buildPaymentMethods(this.data.selectedPaymentMethod),
      });
    } catch (error) {
      this.setData({ preview: null, previewAddress: null, hasPreviewAddress: false });
      showError(error);
    }
  },

  chooseAddress() {
    wx.navigateTo({ url: '/pages/address/index?mode=select' });
  },

  chooseCoupon() {
    wx.navigateTo({ url: '/pages/coupons/index?mode=select' });
  },

  onRemarkInput(event) {
    this.setData({ remark: event.detail.value });
  },

  selectPayment(event) {
    const selectedPaymentMethod = event.currentTarget.dataset.id;
    this.setData({
      selectedPaymentMethod,
      paymentMethods: buildPaymentMethods(selectedPaymentMethod),
    });
  },

  async createOnly() {
    await this.submit(false);
  },

  async createAndPay() {
    await this.submit(true);
  },

  async submit(shouldPay) {
    try {
      await service.setCartRemark(this.data.remark);
      const created = await service.createOrder({
        addressId: this.data.selectedAddressId,
        couponId: this.data.selectedCouponId,
        remark: this.data.remark,
      });
      let order = created.order;
      if (shouldPay) {
        order = await service.payOrder({
          orderId: order.id,
          paymentMethod: this.data.selectedPaymentMethod,
        });
      }
      wx.removeStorageSync(ADDRESS_KEY);
      wx.removeStorageSync(COUPON_KEY);
      showSuccess(shouldPay ? '下单并支付成功' : '订单已创建');
      wx.redirectTo({ url: `/pages/order-detail/index?orderId=${order.id}` });
    } catch (error) {
      showError(error);
    }
  },
});
