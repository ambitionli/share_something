function isLoggedIn() {
  const app = getApp();
  return !!(app.globalData && app.globalData.openid);
}

function requireLogin() {
  if (!isLoggedIn()) {
    wx.navigateTo({ url: '/pages/login/login' });
    return false;
  }
  return true;
}

module.exports = {
  isLoggedIn,
  requireLogin
};
