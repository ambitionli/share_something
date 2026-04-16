function showToast(title, icon) {
  if (typeof wx !== "undefined" && typeof wx.showToast === "function") {
    wx.showToast({
      title,
      icon: icon || "none"
    });
  }
}

function showSuccess(title) {
  showToast(title, "success");
}

function withLoading(title, task) {
  if (typeof wx !== "undefined" && typeof wx.showLoading === "function") {
    wx.showLoading({
      title: title || "加载中",
      mask: true
    });
  }

  return Promise.resolve()
    .then(task)
    .finally(() => {
      if (typeof wx !== "undefined" && typeof wx.hideLoading === "function") {
        wx.hideLoading();
      }
    });
}

function generateClientToken() {
  return `token_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
}

module.exports = {
  showToast,
  showSuccess,
  withLoading,
  generateClientToken
};
