const service = require('../../services/app-service');
const { setTitle, showError, showSuccess } = require('../../utils/page');

const STORAGE_KEY = 'linli-jida-selected-coupon';

function decorateCoupons(coupons, isSelectMode) {
  return coupons.map((item) => ({
    ...item,
    canSelect: isSelectMode && item.status === 'unused',
  }));
}

Page({
  data: {
    mode: 'manage',
    isSelectMode: false,
    coupons: [],
  },

  onLoad(options) {
    const mode = options.mode || 'manage';
    this.setData({ mode, isSelectMode: mode === 'select' });
    setTitle('优惠券');
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    try {
      const coupons = service.listCoupons();
      this.setData({ coupons: decorateCoupons(coupons, this.data.isSelectMode) });
    } catch (error) {
      showError(error);
    }
  },

  selectCoupon(event) {
    if (!this.data.isSelectMode) {
      return;
    }
    wx.setStorageSync(STORAGE_KEY, event.currentTarget.dataset.id);
    showSuccess('优惠券已选择');
    wx.navigateBack();
  },

  clearCoupon() {
    if (!this.data.isSelectMode) {
      return;
    }
    wx.removeStorageSync(STORAGE_KEY);
    showSuccess('已清除优惠券');
    wx.navigateBack();
  },
});
