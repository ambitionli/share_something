const store = require("../../utils/store");

Page({
  data: {
    orderId: "",
    rating: 5,
    content: "",
    imagesText: ""
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId || "" });
  },

  handleRatingInput(event) {
    this.setData({ rating: Number(event.detail.value) || 5 });
  },

  handleContentInput(event) {
    this.setData({ content: event.detail.value });
  },

  handleImagesInput(event) {
    this.setData({ imagesText: event.detail.value });
  },

  submit() {
    try {
      const images = this.data.imagesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      store.submitReview(this.data.orderId, this.data.rating, this.data.content, images);
      wx.showToast({ title: "评价提交成功", icon: "success" });
      setTimeout(() => {
        wx.navigateBack();
      }, 500);
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  }
});
