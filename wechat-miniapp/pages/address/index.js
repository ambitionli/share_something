const appService = require('../../services/appService');

Page({
  data: {
    addresses: [],
    form: { contactName: '', phone: '', detail: '', tag: '家', isDefault: true }
  },
  onShow() {
    this.loadData();
  },
  loadData() {
    this.setData({ addresses: appService.listAddresses() });
  },
  onFieldInput(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ ['form.' + key]: event.detail.value });
  },
  onDefaultChange(event) {
    this.setData({ 'form.isDefault': !!event.detail.value.length });
  },
  saveAddress() {
    try {
      appService.saveAddress(this.data.form);
      this.setData({ form: { contactName: '', phone: '', detail: '', tag: '家', isDefault: false } });
      this.loadData();
      wx.showToast({ title: '地址已保存', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
