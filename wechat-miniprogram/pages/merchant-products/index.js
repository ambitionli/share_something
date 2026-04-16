const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

Page({
  data: {
    products: [],
  },

  onLoad() {
    setTitle('商品管理');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      this.setData({ products: service.listMerchantProducts() });
    } catch (error) {
      showError(error);
    }
  },

  addProduct() {
    wx.navigateTo({ url: '/pages/merchant-product-form/index' });
  },

  editProduct(event) {
    wx.navigateTo({ url: `/pages/merchant-product-form/index?productId=${event.currentTarget.dataset.id}` });
  },

  async toggleStatus(event) {
    try {
      await service.toggleMerchantProduct(event.currentTarget.dataset.id);
      showSuccess('商品状态已更新');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },
});
