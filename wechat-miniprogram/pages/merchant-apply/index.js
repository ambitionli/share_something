const service = require('../../services/app-service');
const { CATEGORY_OPTIONS } = require('../../shared/constants');
const { setTitle, showError, showSuccess } = require('../../utils/page');

function buildCategories(selectedId) {
  return CATEGORY_OPTIONS.filter((item) => item.id !== 'all').map((item) => ({
    ...item,
    activeClass: selectedId === item.id ? 'category-chip-active' : '',
  }));
}

Page({
  data: {
    categories: buildCategories('restaurant'),
    form: {
      name: '我的新店',
      category: 'restaurant',
      intro: '主营简餐、夜宵和饮品，支持到店自提。',
      licenseImagesText: 'license-a.png,license-b.png',
    },
  },

  onLoad() {
    setTitle('商家入驻');
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

  async submit() {
    try {
      await service.merchantApply({
        name: this.data.form.name,
        category: this.data.form.category,
        intro: this.data.form.intro,
        licenseImages: this.data.form.licenseImagesText.split(',').map((item) => item.trim()).filter(Boolean),
      });
      showSuccess('入驻成功，已自动通过审核');
      wx.redirectTo({ url: '/pages/merchant-dashboard/index' });
    } catch (error) {
      showError(error);
    }
  },
});
