const service = require('../../services/app-service');
const { setTitle, showError, showSuccess, confirm } = require('../../utils/page');

Page({
  data: {
    merchantId: '',
    merchant: null,
    products: [],
    reviews: [],
    cartTotal: 0,
    cartCount: 0,
  },

  onLoad(options) {
    const merchantId = options.merchantId || '';
    this.setData({ merchantId });
    setTitle('商家详情');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const detail = service.getMerchantDetail(this.data.merchantId);
      const cart = service.getCart();
      const cartMap = {};
      detail.cartItems.forEach((item) => {
        cartMap[item.productId] = item.quantity;
      });
      const products = detail.products.map((item) => ({
        ...item,
        cartQuantity: cartMap[item.id] || 0,
      }));
      this.setData({
        merchant: detail.merchant,
        products,
        reviews: detail.reviews,
        cartTotal: cart.subtotal,
        cartCount: cart.itemCount,
      });
    } catch (error) {
      showError(error);
    }
  },

  async changeCount(event) {
    const { productId, delta } = event.currentTarget.dataset;
    try {
      await service.updateCartItem({
        merchantId: this.data.merchantId,
        productId,
        delta: Number(delta),
      });
      this.refresh();
    } catch (error) {
      if (error.code === 'CART_MERCHANT_CONFLICT') {
        const ok = await confirm({ title: '切换商家', content: error.message, confirmText: '切换' });
        if (ok) {
          await service.updateCartItem({
            merchantId: this.data.merchantId,
            productId,
            delta: Number(delta),
            replaceMerchantCart: true,
          });
          this.refresh();
        }
        return;
      }
      showError(error);
    }
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/index' });
  },

  async buyNow(event) {
    try {
      await service.updateCartItem({
        merchantId: this.data.merchantId,
        productId: event.currentTarget.dataset.id,
        delta: 1,
      });
      showSuccess('已加入购物车');
      wx.navigateTo({ url: '/pages/checkout/index' });
    } catch (error) {
      showError(error);
    }
  },
});
