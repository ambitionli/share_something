const api = require("../../services/api");

Page({
  data: {
    orderId: "",
    score: 5,
    content: "",
    order: null,
    images: [],
    stars: [
      { value: 1, label: "1 星" },
      { value: 2, label: "2 星" },
      { value: 3, label: "3 星" },
      { value: 4, label: "4 星" },
      { value: 5, label: "5 星" }
    ],
    submitting: false,
  },

  onLoad(options) {
    this.setData({
      orderId: options.orderId || "",
    });
  },

  onShow() {
    this.loadOrder();
  },

  async loadOrder() {
    if (!this.data.orderId) {
      return;
    }

    try {
      const result = await api.getOrderDetail(this.data.orderId);
      this.setData({
        order: result.order,
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none",
      });
    }
  },

  chooseScore(event) {
    this.setData({
      score: Number(event.currentTarget.dataset.score),
    });
  },

  onContentInput(event) {
    this.setData({
      content: event.detail.value,
    });
  },

  addMockImage() {
    const next = this.data.images.concat([
      `https://dummyimage.com/120x120/${
        ["ffd54f", "ffab91", "90caf9"][this.data.images.length % 3]
      }/ffffff&text=${this.data.images.length + 1}`
    ]).slice(0, 3);
    this.setData({
      images: next
    });
  },

  async submitReview() {
    if (this.data.submitting) {
      return;
    }

    try {
      this.setData({ submitting: true });
      await api.submitReview({
        orderId: this.data.orderId,
        score: this.data.score,
        content: this.data.content,
        images: this.data.images,
      });
      wx.showToast({
        title: "评价成功",
        icon: "success",
      });
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/orders/index?focusId=${this.data.orderId}`,
        });
      }, 300);
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none",
      });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
