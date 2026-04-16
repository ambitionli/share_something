const appService = require('../../services/appService');

Page({
  data: {
    merchant: null,
    products: [],
    form: { id: '', name: '', description: '', price: 0, stock: 0, unit: '份' }
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      this.setData(appService.getMerchantProductsView());
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  onFieldInput(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: event.detail.value });
  },
  editProduct(event) {
    this.setData({ form: event.currentTarget.dataset.product });
  },
  saveProduct() {
    try {
      appService.saveProduct(this.data.form);
      this.setData({ form: { id: '', name: '', description: '', price: 0, stock: 0, unit: '份' } });
      this.loadData();
      wx.showToast({ title: '商品已保存', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  toggleProduct(event) {
    try {
      appService.toggleProductStatus(event.currentTarget.dataset.id);
      this.loadData();
      wx.showToast({ title: '商品状态已切换', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
