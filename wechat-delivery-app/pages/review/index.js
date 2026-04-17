const api = require("../../utils/api");
const { showToast, showSuccess, withLoading } = require("../../utils/helpers");

Page({
  data: {
    orderId: "",
    rating: 5,
    stars: [1, 2, 3, 4, 5],
    content: "配送很快，商品完好，体验不错。",
    images: ["meal.jpg", "package.jpg"],
    order: null
  },

  onLoad(options) {
    this.setData({
      orderId: options.orderId
    });
  },

  onShow() {
    if (this.data.orderId) {
      this.setData({
        order: api.getOrderDetail(this.data.orderId)
      });
    }
  },

  onContentInput(event) {
    this.setData({
      content: event.detail.value
    });
  },

  chooseRating(event) {
    this.setData({
      rating: Number(event.currentTarget.dataset.rating)
    });
  },

  addMockImage() {
    const nextIndex = this.data.images.length + 1;
    this.setData({
      images: this.data.images.concat(`review_${nextIndex}.jpg`)
    });
  },

  submitReview() {
    withLoading("提交评价中", () => {
      api.submitReview({
        orderId: this.data.orderId,
        rating: this.data.rating,
        content: this.data.content,
        images: this.data.images
      });
      showSuccess("评价成功");
      wx.redirectTo({
        url: `/pages/order-detail/index?id=${this.data.orderId}`
      });
    }).catch((error) => {
      showToast(error.message);
    });
  }
});
