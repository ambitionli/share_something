const service = require('../../services/app-service');
const { CATEGORY_OPTIONS } = require('../../shared/constants');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function buildCategories(selectedId) {
  return CATEGORY_OPTIONS.filter((item) => item.id !== 'all').map((item) => ({
    ...item,
    activeClass: selectedId === item.id ? 'category-chip-active' : '',
  }));
}

function initialForm() {
  return {
    productId: '',
    name: '',
    description: '',
    category: 'restaurant',
    price: '18',
    originPrice: '21',
    stock: '20',
    unit: '份',
  };
}

Page({
  data: {
    categories: buildCategories('restaurant'),
    form: initialForm(),
  },

  onLoad(options) {
    setTitle('商品编辑');
    if (options.productId) {
      const product = service.listMerchantProducts().find((item) => item.id === options.productId);
      if (product) {
        this.setData({
          categories: buildCategories(product.category),
          form: {
            productId: product.id,
            name: product.name,
            description: product.description,
            category: product.category,
            price: String(product.price),
            originPrice: String(product.originPrice),
            stock: String(product.stock),
            unit: product.unit,
          },
        });
      }
    }
  },

  onInput(event) {
    const key = event.currentTarget.dataset.key;
    this.setData({ [`form.${key}`]: event.detail.value });
  },

  selectCategory(event) {
    const category = event.currentTarget.dataset.id;
    this.setData({
      'form.category': category,
      categories: buildCategories(category),
    });
  },

  async save() {
    try {
      await service.saveMerchantProduct({
        productId: this.data.form.productId,
        name: this.data.form.name,
        description: this.data.form.description,
        category: this.data.form.category,
        price: Number(this.data.form.price),
        originPrice: Number(this.data.form.originPrice),
        stock: Number(this.data.form.stock),
        unit: this.data.form.unit,
      });
      showSuccess('商品已保存');
      wx.navigateBack();
    } catch (error) {
      showError(error);
    }
  },
});
