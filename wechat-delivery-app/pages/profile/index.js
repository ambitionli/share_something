const api = require("../../utils/api");
const { showSuccess, showToast, withLoading } = require("../../utils/helpers");

Page({
  data: {
    user: null,
    coupons: [],
    addresses: [],
    merchant: null,
    support: null,
    quickUsers: [
      { phone: "13800138000", nickname: "小周", label: "切换买家演示账号" },
      { phone: "13900139000", nickname: "鲜选便利店", label: "切换商家演示账号" }
    ]
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const data = api.getProfileData();
    this.setData(data);
  },

  openMerchantCenter() {
    wx.switchTab({
      url: "/pages/merchant-center/index"
    });
  },

  goAddresses() {
    wx.navigateTo({
      url: "/pages/addresses/index"
    });
  },

  switchDemoUser(event) {
    const phone = event.currentTarget.dataset.phone;
    const nickname = event.currentTarget.dataset.nickname;
    withLoading("切换中", () => {
      api.loginWithPhone({
        phone,
        nickname
      });
      getApp().refreshCurrentUser();
      this.loadData();
      showSuccess("已切换账号");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  openSupport() {
    showToast(`客服热线 ${this.data.support.phone}`);
  },

  resetDemo() {
    withLoading("重置中", () => {
      api.resetDemo();
      getApp().refreshCurrentUser();
      this.loadData();
      showSuccess("演示数据已重置");
    }).catch((error) => {
      showToast(error.message);
    });
  }
});
