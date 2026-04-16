const service = require('../../services/app-service');
const { setTitle, showError, showSuccess, confirm } = require('../../utils/page');

Page({
  data: {
    cart: {
      merchant: null,
      items: [],
      remark: '',
      subtotal: 0,
      itemCount: 0,
    },
    remarkDraft: '',
  },

  onLoad() {
    setTitle('购物车');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const cart = service.getCart();
      this.setData({
        cart,
        remarkDraft: cart.remark || '',
      });
    } catch (error) {
      showError(error);
    }
  },

  async changeCount(event) {
    try {
      await service.updateCartItem({
        merchantId: this.data.cart.merchant.id,
        productId: event.currentTarget.dataset.id,
        delta: Number(event.currentTarget.dataset.delta),
      });
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  onRemarkInput(event) {
    this.setData({ remarkDraft: event.detail.value });
  },

  async saveRemark() {
    try {
      await service.setCartRemark(this.data.remarkDraft);
      showSuccess('备注已保存');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async clearCart() {
    try {
      const ok = await confirm({ title: '清空购物车', content: '确认清空当前购物车吗？', confirmText: '清空' });
      if (!ok) {
        return;
      }
      await service.clearCart();
      showSuccess('已清空');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  goCheckout() {
    if (!this.data.cart.items.length) {
      showError(new Error('请先添加商品')); 
      return;
    }
    wx.navigateTo({ url: '/pages/checkout/index' });
  },

  goHome() {
    wx.reLaunch({ url: '/pages/home/index' });
  },
});
