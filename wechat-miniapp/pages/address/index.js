const store = require("../../utils/store");

Page({
  data: {
    addresses: [],
    form: {
      id: "",
      name: "",
      phone: "",
      detail: "",
      tag: "家",
      isDefault: true
    }
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    this.setData({ addresses: store.listAddresses() });
  },

  bindField(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({
      [`form.${key}`]: event.detail.value
    });
  },

  toggleDefault() {
    this.setData({
      "form.isDefault": !this.data.form.isDefault
    });
  },

  editAddress(event) {
    const address = this.data.addresses.find((item) => item.id === event.currentTarget.dataset.id);
    if (address) {
      this.setData({ form: { ...address } });
    }
  },

  saveAddress() {
    try {
      store.saveAddress(this.data.form);
      wx.showToast({ title: "地址已保存", icon: "success" });
      this.setData({
        form: {
          id: "",
          name: "",
          phone: "",
          detail: "",
          tag: "家",
          isDefault: false
        }
      });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  }
});
