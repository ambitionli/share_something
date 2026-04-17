const api = require("../../utils/api");
const { showToast, withLoading } = require("../../utils/helpers");

Page({
  data: {
    phone: "13800138000",
    nickname: "小周",
    demoUsers: [
      { id: "user_1", label: "用户端演示账号", phone: "13800138000", nickname: "小周" },
      { id: "user_2", label: "商家端演示账号", phone: "13900139000", nickname: "鲜选便利店" }
    ]
  },

  onShow() {
    const currentUser = api.getCurrentUser();
    if (currentUser) {
      this.setData({
        phone: currentUser.phone || this.data.phone,
        nickname: currentUser.nickname || this.data.nickname
      });
    }
  },

  onInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [field]: event.detail.value
    });
  },

  useDemoUser(event) {
    const { phone, nickname } = event.currentTarget.dataset;
    this.setData({
      phone,
      nickname
    });
  },

  submitPhoneLogin() {
    withLoading("登录中", () => {
      const user = api.loginWithPhone({
        phone: this.data.phone,
        nickname: this.data.nickname
      });
      getApp().refreshCurrentUser();
      wx.switchTab({
        url: "/pages/home/index"
      });
      return user;
    }).catch((error) => {
      showToast(error.message);
    });
  },

  submitWechatLogin() {
    withLoading("授权中", () => {
      api.loginWithWechat();
      getApp().refreshCurrentUser();
      wx.switchTab({
        url: "/pages/home/index"
      });
    }).catch((error) => {
      showToast(error.message);
    });
  }
});
