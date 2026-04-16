const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');
const app = getApp();

Page({
  data: {
    name: '',
    cats: [
      { key: 'food', label: '餐饮' },
      { key: 'market', label: '超市' },
      { key: 'medicine', label: '药品' },
      { key: 'fresh', label: '生鲜' }
    ],
    catIndex: 0,
    licenses: []
  },

  onShow() {
    auth.requireLogin();
  },

  onName(e) {
    this.setData({ name: e.detail.value });
  },

  onCat(e) {
    this.setData({ catIndex: Number(e.detail.value) });
  },

  pick() {
    wx.chooseMedia({
      count: 6 - this.data.licenses.length,
      mediaType: ['image'],
      success: (res) => {
        const paths = (res.tempFiles || []).map((f) => f.tempFilePath);
        this.setData({ licenses: this.data.licenses.concat(paths) });
      }
    });
  },

  async submit() {
    const name = (this.data.name || '').trim();
    if (!name) {
      wx.showToast({ title: '请填写店铺名', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '提交中' });
    try {
      const fileIds = [];
      for (const p of this.data.licenses) {
        const ext = p.indexOf('.') >= 0 ? p.slice(p.lastIndexOf('.')) : '.jpg';
        const up = await wx.cloud.uploadFile({
          cloudPath: 'licenses/' + Date.now() + '_' + Math.random() + ext,
          filePath: p
        });
        fileIds.push(up.fileID);
      }
      const cat = this.data.cats[this.data.catIndex].key;
      const r = await cloud.call('merchant_register', {
        name,
        category: cat,
        licenseImages: fileIds
      });
      app.setMerchantId(r.merchantId);
      wx.showToast({ title: '入驻成功' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/merchant-dashboard/merchant-dashboard' });
      }, 400);
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
