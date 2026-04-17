const api = require("../../utils/api");
const { CATEGORY_OPTIONS } = require("../../shared/constants");
const { showSuccess, showToast, withLoading } = require("../../utils/helpers");

function createJoinForm() {
  return {
    name: "",
    category: "food",
    address: "",
    deliveryFee: "4",
    minOrderAmount: "20",
    avgDeliveryMinutes: "30",
    notice: "",
    certificationsText: "营业执照,食品经营许可"
  };
}

function createProductForm() {
  return {
    id: "",
    name: "",
    price: "",
    originalPrice: "",
    stock: "",
    description: "",
    tagsText: "",
    isOnShelf: true
  };
}

Page({
  data: {
    categories: CATEGORY_OPTIONS.filter((item) => item.id !== "all"),
    categoryNames: CATEGORY_OPTIONS.filter((item) => item.id !== "all").map((item) => item.name),
    certOptions: ["营业执照", "食品经营许可", "药品经营许可证", "配送资质"],
    selectedCerts: {},
    joinCategoryIndex: 0,
    merchant: null,
    products: [],
    orders: [],
    stats: null,
    joinForm: createJoinForm(),
    productForm: createProductForm()
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const merchant = api.getOwnedMerchant();
    const nextData = {
      merchant,
      products: api.getMerchantProducts(),
      orders: api.getMerchantOrders(),
      stats: api.getMerchantStats()
    };

    if (merchant) {
      const categoryIndex = this.data.categories.findIndex((item) => item.id === merchant.category);
      const selectedCerts = {};
      (merchant.certifications || []).forEach((item) => {
        selectedCerts[item] = true;
      });
      nextData.joinForm = {
        name: merchant.name,
        category: merchant.category,
        address: merchant.address,
        deliveryFee: String(merchant.deliveryFee),
        minOrderAmount: String(merchant.minOrderAmount),
        avgDeliveryMinutes: String(merchant.avgDeliveryMinutes),
        notice: merchant.notice,
        certificationsText: (merchant.certifications || []).join(",")
      };
      nextData.joinCategoryIndex = categoryIndex >= 0 ? categoryIndex : 0;
      nextData.selectedCerts = selectedCerts;
    } else {
      const selectedCerts = {};
      this.data.joinForm.certificationsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => {
          selectedCerts[item] = true;
        });
      nextData.selectedCerts = selectedCerts;
    }

    this.setData(nextData);
  },

  onJoinInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`joinForm.${field}`]: event.detail.value
    });
  },

  onCategoryChange(event) {
    const index = Number(event.detail.value);
    const category = this.data.categories[index];
    if (!category) {
      return;
    }
    this.setData({
      joinCategoryIndex: index,
      "joinForm.category": category.id
    });
  },

  toggleCert(event) {
    const cert = event.currentTarget.dataset.cert;
    const selectedCerts = {
      ...this.data.selectedCerts,
      [cert]: !this.data.selectedCerts[cert]
    };
    const certifications = Object.keys(selectedCerts).filter((key) => selectedCerts[key]);
    this.setData({
      selectedCerts,
      "joinForm.certificationsText": certifications.join(",")
    });
  },

  submitJoin() {
    withLoading("提交中", () => {
      api.submitMerchantApplication({
        ...this.data.joinForm,
        certifications: this.data.joinForm.certificationsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      this.loadData();
      showSuccess("入驻申请已提交");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  onProductInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      [`productForm.${field}`]: event.detail.value
    });
  },

  onProductShelfChange(event) {
    this.setData({
      "productForm.isOnShelf": event.detail.value
    });
  },

  editProduct(event) {
    const productId = event.currentTarget.dataset.id;
    const product = this.data.products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    this.setData({
      productForm: {
        id: product.id,
        name: product.name,
        price: String(product.price),
        originalPrice: String(product.originalPrice),
        stock: String(product.stock),
        description: product.description,
        tagsText: (product.tags || []).join(","),
        isOnShelf: product.isOnShelf
      }
    });
  },

  resetProductForm() {
    this.setData({
      productForm: createProductForm()
    });
  },

  saveProduct() {
    withLoading("保存中", () => {
      api.saveProduct({
        ...this.data.productForm,
        tags: this.data.productForm.tagsText
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      });
      this.loadData();
      this.resetProductForm();
      showSuccess("商品已保存");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  switchShelf(event) {
    const productId = event.currentTarget.dataset.id;
    const isOnShelf = event.currentTarget.dataset.shelf === "1";
    withLoading("处理中", () => {
      api.toggleProductShelf(productId, isOnShelf);
      this.loadData();
      showSuccess(isOnShelf ? "已上架" : "已下架");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  acceptOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    withLoading("接单中", () => {
      api.acceptMerchantOrder(orderId);
      this.loadData();
      showSuccess("已接单");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  rejectOrder(event) {
    const orderId = event.currentTarget.dataset.id;
    withLoading("处理中", () => {
      api.rejectMerchantOrder(orderId, "门店暂时繁忙");
      this.loadData();
      showSuccess("已拒单");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  markDelivering(event) {
    const orderId = event.currentTarget.dataset.id;
    withLoading("更新中", () => {
      api.markMerchantDelivering(orderId);
      this.loadData();
      showSuccess("已标记配送");
    }).catch((error) => {
      showToast(error.message);
    });
  },

  handleRefund(event) {
    const orderId = event.currentTarget.dataset.id;
    const approve = event.currentTarget.dataset.approve === "1";
    withLoading("处理中", () => {
      api.handleMerchantRefund(orderId, approve);
      this.loadData();
      showSuccess(approve ? "退款已通过" : "退款已驳回");
    }).catch((error) => {
      showToast(error.message);
    });
  }
});
