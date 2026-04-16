const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function buildStars(rating) {
  return [1, 2, 3, 4, 5].map((value) => ({
    value,
    activeClass: rating >= value ? 'star-active' : '',
  }));
}

Page({
  data: {
    orderId: '',
    rating: 5,
    stars: buildStars(5),
    content: '配送很快，服务不错',
    imagesText: 'review-1.png,review-2.png',
    detail: null,
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId || '' });
    setTitle('订单评价');
    this.refresh();
  },

  refresh() {
    try {
      const detail = service.getOrderDetail(this.data.orderId);
      this.setData({ detail });
    } catch (error) {
      showError(error);
    }
  },

  chooseRating(event) {
    const rating = Number(event.currentTarget.dataset.value);
    this.setData({
      rating,
      stars: buildStars(rating),
    });
  },

  onContentInput(event) {
    this.setData({ content: event.detail.value });
  },

  onImagesInput(event) {
    this.setData({ imagesText: event.detail.value });
  },

  async submit() {
    try {
      await service.submitReview({
        orderId: this.data.orderId,
        rating: this.data.rating,
        content: this.data.content,
        images: this.data.imagesText ? this.data.imagesText.split(',').map((item) => item.trim()).filter(Boolean) : [],
      });
      showSuccess('评价提交成功');
      wx.redirectTo({ url: `/pages/order-detail/index?orderId=${this.data.orderId}` });
    } catch (error) {
      showError(error);
    }
  },
});
