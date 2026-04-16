const api = require("../../services/api");
const { formatMoney, formatStatus } = require("../../utils/format");

function buildEmptyForm() {
  return {
    name: "",
    category: "restaurant",
    description: "",
    minOrder: "20",
    deliveryFee: "4",
    avgDeliveryMinutes: "30",
    address: "",
    notice: ""
  };
}

function buildProductForm(product) {
  if (!product) {
    return {
      id: "",
      name: "",
      price: "12",
      originalPrice: "15",
      stock: "20",
      image: "",
      onShelf: true
    };
  }

  return {
    id: product.id,
    name: product.name,
    price: String(product.price),
    originalPrice: String(product.originalPrice || product.price),
    stock: String(product.stock),
    image: product.image || "",
    onShelf: product.onShelf !== false
  };
}

Page({
  data: {
    user: null,
    merchant: null,
    products: [],
    orders: [],
    stats: null,
    joinForm: buildEmptyForm(),
    productForm: buildProductForm(),
    editingProductId: "",
    refundReason: "",
    loading: true
  },

  onShow() {
    this.loadPage();
  },

  async loadPage() {
    const user = api.getCurrentUser();
    this.setData({
      user,
      loading: true
    });

    if (!user) {
      this.setData({
        merchant: null,
        products: [],
        orders: [],
        stats: null,
        loading: false
      });
      return;
    }

    try {
      const result = await api.getMerchantCenterData();
      const orders = result.orders.map((item) =>
        Object.assign({}, item, {
          payableAmountDisplay: formatMoney(item.payableAmount),
          statusLabel: formatStatus(item.status)
        })
      );
      this.setData({
        user: api.getCurrentUser(),
        merchant: result.merchant,
        products: result.products,
        orders,
        stats: result.stats,
        loading: false
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  openLogin() {
    wx.navigateTo({
      url: "/pages/auth-login/index"
    });
  },

  goLogin() {
    this.openLogin();
  },

  onCategoryChange(event) {
    const categories = [
      { value: "restaurant", label: "餐饮" },
      { value: "market", label: "超市" },
      { value: "pharmacy", label: "药品" },
      { value: "fresh", label: "生鲜" }
    ];
    const target = categories[event.detail.value] || categories[0];
    this.setData({
      joinForm: Object.assign({}, this.data.joinForm, {
        category: target.value,
        categoryLabel: target.label
      })
    });
  },

  onJoinInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      joinForm: Object.assign({}, this.data.joinForm, {
        [field]: event.detail.value
      })
    });
  },

  async submitJoin() {
    try {
      await api.joinMerchant(this.data.joinForm);
      wx.showToast({
        title: "入驻成功",
        icon: "success"
      });
      this.setData({
        joinForm: buildEmptyForm()
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  onProductInput(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({
      productForm: Object.assign({}, this.data.productForm, {
        [field]: event.detail.value
      })
    });
  },

  fillProductForm(event) {
    const productId = event.currentTarget.dataset.id;
    const product = this.data.products.find((item) => item.id === productId);
    this.setData({
      editingProductId: productId,
      productForm: buildProductForm(product)
    });
  },

  resetProductForm() {
    this.setData({
      editingProductId: "",
      productForm: buildProductForm()
    });
  },

  async submitProduct() {
    try {
      await api.upsertProduct({
        id: this.data.editingProductId || "",
        name: this.data.productForm.name,
        price: Number(this.data.productForm.price),
        originalPrice: Number(this.data.productForm.originalPrice),
        stock: Number(this.data.productForm.stock),
        image: this.data.productForm.image,
        onShelf: this.data.productForm.onShelf
      });
      wx.showToast({
        title: this.data.editingProductId ? "商品已更新" : "商品已新增",
        icon: "success"
      });
      this.resetProductForm();
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  saveProduct() {
    return this.submitProduct();
  },

  editProduct(event) {
    return this.fillProductForm(event);
  },

  async toggleShelf(event) {
    const productId = event.currentTarget.dataset.id;
    const onShelf = event.currentTarget.dataset.onShelf === "true";
    try {
      await api.toggleProductShelf(productId, !onShelf);
      wx.showToast({
        title: !onShelf ? "已上架" : "已下架",
        icon: "none"
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async acceptOrder(event) {
    try {
      await api.merchantAcceptOrder(event.currentTarget.dataset.id);
      wx.showToast({
        title: "已接单",
        icon: "success"
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async dispatchOrder(event) {
    try {
      await api.merchantDispatchOrder(event.currentTarget.dataset.id);
      wx.showToast({
        title: "已开始配送",
        icon: "success"
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async rejectOrder(event) {
    try {
      await api.merchantRejectOrder(
        event.currentTarget.dataset.id,
        "商家当前运力不足，系统自动退款"
      );
      wx.showToast({
        title: "已拒单并退款",
        icon: "none"
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  onRefundReasonInput(event) {
    this.setData({
      refundReason: event.detail.value
    });
  },

  async approveRefund(event) {
    try {
      await api.processRefund(
        event.currentTarget.dataset.id,
        true,
        this.data.refundReason || "同意退款"
      );
      this.setData({ refundReason: "" });
      wx.showToast({
        title: "退款已处理",
        icon: "success"
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  async rejectRefund(event) {
    try {
      await api.processRefund(
        event.currentTarget.dataset.id,
        false,
        this.data.refundReason || "订单已进入配送阶段，驳回退款"
      );
      this.setData({ refundReason: "" });
      wx.showToast({
        title: "已驳回退款",
        icon: "none"
      });
      await this.loadPage();
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none"
      });
    }
  },

  handleRefund(event) {
    const approve = event.currentTarget.dataset.approve === "true";
    if (approve) {
      return this.approveRefund(event);
    }
    return this.rejectRefund(event);
  }
});
