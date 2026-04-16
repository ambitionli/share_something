const app = getApp();

Page({
  data: {
    coupons: []
  },

  onShow() {
    const n = (app.globalData.user && app.globalData.user.couponCount) || 3;
    const list = [];
    for (let i = 0; i < Math.min(n, 5); i++) {
      list.push({
        id: 'c' + i,
        amount: 5 + i,
        name: '满减券 · 邻刻达新客',
        rule: '满 30 元可用',
        expire: '2026-12-31'
      });
    }
    this.setData({ coupons: list });
  }
});
