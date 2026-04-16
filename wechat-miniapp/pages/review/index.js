const appService = require('../../services/appService');

Page({
  data: { orderId: '', order: null, rating: 5, content: '', imagesText: '' },
  onLoad(options) {
    this.setData({ orderId: options.orderId || '' });
    this.loadData();
  },
  loadData() {
    try {
      this.setData({ order: appService.getOrderDetail(this.data.orderId) });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  },
  selectStar(event) {
    this.setData({ rating: Number(event.currentTarget.dataset.star) });
  },
  onContentInput(event) {
    this.setData({ content: event.detail.value });
  },
  onImagesInput(event) {
    this.setData({ imagesText: event.detail.value });
  },
  submitReview() {
    try {
      appService.submitReview({
        orderId: this.data.orderId,
        rating: this.data.rating,
        content: this.data.content,
        images: this.data.imagesText ? this.data.imagesText.split(',').map(function (item) {
          return item.trim();
        }).filter(Boolean) : []
      });
      wx.showToast({ title: '评价成功', icon: 'none' });
      wx.switchTab({ url: '/pages/orders/index' });
    } catch (error) {
      wx.showToast({ title: error.message, icon: 'none' });
    }
  }
});
