Page({
  clearCart() {
    try {
      wx.removeStorageSync('cart');
      const app = getApp();
      app.globalData.cart = {};
      wx.showToast({ title: '已清除' });
    } catch (e) {
      wx.showToast({ title: '清除失败', icon: 'none' });
    }
  }
});
