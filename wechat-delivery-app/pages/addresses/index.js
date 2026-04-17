const api = require("../../utils/api");
const { showSuccess, showToast } = require("../../utils/helpers");

function createEmptyForm() {
  return {
    id: "",
    receiver: "",
    phone: "",
    detail: "",
    tag: "家",
    isDefault: true
  };
}

Page({
  data: {
    mode: "manage",
    addresses: [],
    editing: createEmptyForm()
  },

  onLoad(options) {
    this.setData({
      mode: options.mode || "manage"
    });
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    this.setData({
      addresses: api.getAddresses()
    });
  },

  startCreate() {
    this.setData({
      editing: createEmptyForm()
    });
  },

  editAddress(event) {
    const address = this.data.addresses.find((item) => item.id === event.currentTarget.dataset.id);
    if (!address) {
      return;
    }
    this.setData({
      editing: { ...address }
    });
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`editing.${field}`]: event.detail.value
    });
  },

  onDefaultChange(event) {
    this.setData({
      "editing.isDefault": event.detail.value
    });
  },

  saveAddress() {
    try {
      api.saveAddress(this.data.editing);
      showSuccess("地址已保存");
      this.setData({
        editing: createEmptyForm()
      });
      this.loadData();
    } catch (error) {
      showToast(error.message);
    }
  },

  deleteAddress(event) {
    try {
      api.deleteAddress(event.currentTarget.dataset.id);
      showSuccess("地址已删除");
      this.loadData();
    } catch (error) {
      showToast(error.message);
    }
  },

  chooseAddress(event) {
    if (this.data.mode !== "select") {
      return;
    }
    const address = this.data.addresses.find((item) => item.id === event.currentTarget.dataset.id);
    const pages = getCurrentPages();
    const previousPage = pages[pages.length - 2];
    if (previousPage && typeof previousPage.onSelectedAddress === "function") {
      previousPage.onSelectedAddress(address);
      wx.navigateBack();
    }
  }
});
