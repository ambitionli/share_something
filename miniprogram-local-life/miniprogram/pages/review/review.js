const cloud = require('../../utils/cloud.js');
const auth = require('../../utils/auth.js');

Page({
  data: {
    orderId: '',
    rating: 5,
    content: '',
    images: []
  },

  onLoad(q) {
    this.setData({
      orderId: q.orderId ? decodeURIComponent(q.orderId) : ''
    });
  },

  onShow() {
    auth.requireLogin();
  },

  onRating(e) {
    this.setData({ rating: Number(e.detail.value) });
  },

  onContent(e) {
    this.setData({ content: e.detail.value });
  },

  pickImage() {
    wx.chooseMedia({
      count: 6 - this.data.images.length,
      mediaType: ['image'],
      success: (res) => {
        const paths = (res.tempFiles || []).map((f) => f.tempFilePath);
        this.setData({ images: this.data.images.concat(paths) });
      }
    });
  },

  async submit() {
    if (!this.data.orderId) {
      return;
    }
    wx.showLoading({ title: '提交中' });
    try {
      const fileIds = [];
      for (const p of this.data.images) {
        const ext = p.indexOf('.') >= 0 ? p.slice(p.lastIndexOf('.')) : '.jpg';
        const up = await wx.cloud.uploadFile({
          cloudPath: 'reviews/' + Date.now() + '_' + Math.random() + ext,
          filePath: p
        });
        fileIds.push(up.fileID);
      }
      await cloud.call('review_create', {
        orderId: this.data.orderId,
        rating: this.data.rating,
        content: this.data.content,
        images: fileIds
      });
      wx.showToast({ title: '感谢评价' });
      setTimeout(() => wx.navigateBack(), 500);
    } catch (e) {
      wx.showToast({ title: e.message || '失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
