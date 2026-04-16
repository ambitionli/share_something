const appService = require('../../services/appService');

Page({
  data: {
    merchant: null,
    form: { name: '', category: '餐饮', licenseText: 'demo-license', deliveryFee: 4, minOrderAmount: 20, notice: '' }
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    try {
      const profile = appService.getProfileView();
      this.setData({ merchant: profile.merchant });
    } catch (error) {
      wx.navigateTo({ url: '/pages/login/index' });
    }
  },
  onFieldInput(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: event.detail.value });
  },
  submitApplication() {
    try {
      const merchant = appService.applyMerchant(this.data.form);
      this.setData({ merchant: merchant });
      wx.showToast({ title: '入驻通过，已开通商家身份', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
