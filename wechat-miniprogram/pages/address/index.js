const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

const STORAGE_KEY = 'linli-jida-selected-address';

function emptyForm() {
  return {
    id: '',
    contactName: '',
    phone: '',
    detail: '',
    tag: '家',
    isDefault: false,
  };
}

function decorateAddresses(addresses, isSelectMode) {
  return addresses.map((item) => ({
    ...item,
    canSelect: isSelectMode,
    canDelete: !item.isDefault,
    deleteDisabled: item.isDefault,
  }));
}

Page({
  data: {
    mode: 'manage',
    isSelectMode: false,
    addresses: [],
    form: emptyForm(),
  },

  onLoad(options) {
    const mode = options.mode || 'manage';
    this.setData({ mode, isSelectMode: mode === 'select' });
    setTitle('地址管理');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const addresses = service.listAddresses();
      this.setData({ addresses: decorateAddresses(addresses, this.data.isSelectMode) });
    } catch (error) {
      showError(error);
    }
  },

  editAddress(event) {
    const address = this.data.addresses.find((item) => item.id === event.currentTarget.dataset.id);
    if (address) {
      this.setData({ form: { ...address } });
    }
  },

  onInput(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: event.detail.value });
  },

  onDefaultChange(event) {
    this.setData({ 'form.isDefault': event.detail.value.length > 0 });
  },

  async save() {
    try {
      await service.saveAddress(this.data.form);
      showSuccess('地址已保存');
      this.setData({ form: emptyForm() });
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async removeAddress(event) {
    try {
      await service.deleteAddress(event.currentTarget.dataset.id);
      showSuccess('地址已删除');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  async setDefault(event) {
    try {
      await service.setDefaultAddress(event.currentTarget.dataset.id);
      showSuccess('默认地址已更新');
      this.refresh();
    } catch (error) {
      showError(error);
    }
  },

  selectAddress(event) {
    if (!this.data.isSelectMode) {
      return;
    }
    wx.setStorageSync(STORAGE_KEY, event.currentTarget.dataset.id);
    showSuccess('已选择地址');
    wx.navigateBack();
  },
});
