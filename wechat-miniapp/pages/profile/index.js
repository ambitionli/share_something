const api = require("../../services/api");
const { formatMoney } = require("../../utils/format");

Page({
  data: {
    user: null,
    merchant: null,
    addresses: [],
    customerService: null,
    settings: null,
    couponCount: 0,
    coupons: [],
    addressCount: 0,
    balanceDisplay: "¥0.00"
  },

  onShow() {
    this.loadProfile();
  },

  async loadProfile() {
    const user = api.getCurrentUser();
    this.setData({
      user
    });
    if (!user) {
      this.setData({
        merchant: null,
        addresses: [],
        customerService: null,
        settings: null,
        couponCount: 0,
        coupons: [],
        addressCount: 0,
        balanceDisplay: "¥0.00"
      });
      return;
    }

    try {
      const result = await api.getProfile();
      this.setData({
        user: result.user,
        merchant: result.merchant,
        addresses: result.addresses,
        customerService: result.customerService,
        settings: result.settings,
        couponCount: (result.user.coupons || []).length,
        coupons: result.user.coupons || [],
        addressCount: result.addresses.length,
        balanceDisplay: formatMoney(result.user.balance)
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  openLogin() {
    wx.navigateTo({
      url: "/pages/auth-login/index"
    });
  },

  openOrders() {
    wx.switchTab({
      url: "/pages/orders/index"
    });
  },

  openMerchantCenter() {
    wx.navigateTo({
      url: "/pages/merchant-center/index"
    });
  },

  async addAddress() {
    const user = api.getCurrentUser();
    if (!user) {
      this.openLogin();
      return;
    }
    const count = this.data.addresses.length + 1;
    try {
      await api.saveAddress({
        name: `联系人${count}`,
        phone: user.phone || "13800000000",
        city: "北京市海淀区",
        detail: `自动新增地址 ${count} 号`,
        tag: count % 2 === 0 ? "家" : "公司",
        isDefault: count === 1
      });
      wx.showToast({
        title: "地址已新增",
        icon: "success"
      });
      this.loadProfile();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async deleteAddress(event) {
    const addressId = event.currentTarget.dataset.id;
    try {
      await api.deleteAddress(addressId);
      wx.showToast({
        title: "地址已删除",
        icon: "none"
      });
      this.loadProfile();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async removeAddress(event) {
    await this.deleteAddress(event);
  },

  async setDefaultAddress(event) {
    const addressId = event.currentTarget.dataset.id;
    const target = this.data.addresses.find((item) => item.id === addressId);
    if (!target) {
      return;
    }
    try {
      await api.saveAddress(
        Object.assign({}, target, {
          isDefault: true
        })
      );
      wx.showToast({
        title: "已设为默认地址",
        icon: "success"
      });
      this.loadProfile();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async makeDefaultAddress(event) {
    await this.setDefaultAddress(event);
  },

  async logout() {
    api.clearCurrentUser();
    wx.showToast({
      title: "已退出登录",
      icon: "none"
    });
    this.loadProfile();
  }
});
