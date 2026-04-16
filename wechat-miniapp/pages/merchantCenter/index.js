const store = require("../../utils/store");

Page({
  data: {
    categories: [],
    categoryIndex: 0,
    productForm: {
      id: "",
      name: "",
      description: "",
      price: "0",
      stock: "0",
      image: "",
      onShelf: true
    },
    applyForm: {
      name: "",
      announcement: "",
      qualificationImagesText: ""
    },
    center: {
      merchant: null,
      overview: null,
      products: [],
      orders: []
    }
  },

  onShow() {
    const categories = store.getHomeData({}).categories;
    this.setData({ categories });
    this.loadData();
  },

  loadData() {
    this.setData({
      center: store.getMerchantCenterData()
    });
  },

  bindApplyField(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({
      [`applyForm.${key}`]: event.detail.value
    });
  },

  chooseCategory(event) {
    this.setData({ categoryIndex: Number(event.detail.value) });
  },

  submitApplication() {
    try {
      const category = this.data.categories[this.data.categoryIndex];
      store.applyMerchant({
        name: this.data.applyForm.name,
        categoryId: category.id,
        announcement: this.data.applyForm.announcement,
        qualificationImages: this.data.applyForm.qualificationImagesText
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      wx.showToast({ title: "入驻信息已提交并通过", icon: "success" });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  bindProductField(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({
      [`productForm.${key}`]: event.detail.value
    });
  },

  editProduct(event) {
    const product = this.data.center.products.find((item) => item.id === event.currentTarget.dataset.id);
    if (product) {
      this.setData({ productForm: { ...product } });
    }
  },

  saveProduct() {
    try {
      store.saveMerchantProduct({
        ...this.data.productForm,
        price: Number(this.data.productForm.price),
        stock: Number(this.data.productForm.stock)
      });
      wx.showToast({ title: "商品已保存", icon: "success" });
      this.setData({
        productForm: {
          id: "",
          name: "",
          description: "",
          price: "0",
          stock: "0",
          image: "",
          onShelf: true
        }
      });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  toggleShelf(event) {
    try {
      store.toggleMerchantProduct(
        event.currentTarget.dataset.id,
        event.currentTarget.dataset.on !== "true"
      );
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  acceptOrder(event) {
    try {
      store.acceptMerchantOrder(event.currentTarget.dataset.id);
      wx.showToast({ title: "已接单", icon: "success" });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  rejectOrder(event) {
    try {
      store.rejectMerchantOrder(event.currentTarget.dataset.id, "商家拒单");
      wx.showToast({ title: "订单已拒绝", icon: "success" });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  deliverOrder(event) {
    try {
      store.deliverMerchantOrder(event.currentTarget.dataset.id, "阿夜", "深夜专送");
      wx.showToast({ title: "已标记配送", icon: "success" });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  },

  processRefund(event) {
    try {
      store.processRefund(event.currentTarget.dataset.id);
      wx.showToast({ title: "退款已处理", icon: "success" });
      this.loadData();
    } catch (error) {
      wx.showToast({ title: error.message, icon: "none" });
    }
  }
});
