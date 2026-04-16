function setTitle(title) {
  if (typeof wx !== 'undefined' && wx.setNavigationBarTitle) {
    wx.setNavigationBarTitle({ title });
  }
}

function showSuccess(title) {
  if (typeof wx !== 'undefined' && wx.showToast) {
    wx.showToast({ title, icon: 'success' });
  }
}

function showError(error) {
  const title = (error && error.message) || '操作失败';
  if (typeof wx !== 'undefined' && wx.showToast) {
    wx.showToast({ title, icon: 'none' });
  }
  console.error(error);
}

async function confirm(options) {
  if (typeof wx === 'undefined' || !wx.showModal) {
    return false;
  }
  const result = await wx.showModal(options);
  return Boolean(result.confirm);
}

module.exports = {
  setTitle,
  showSuccess,
  showError,
  confirm,
};
