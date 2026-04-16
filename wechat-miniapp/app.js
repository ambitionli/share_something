const store = require("./utils/store");

App({
  globalData: {
    service: store,
    currentUser: null
  },

  onLaunch() {
    const boot = store.bootstrap();
    this.globalData.currentUser = boot.profile.user;
  },

  refreshCurrentUser() {
    this.globalData.currentUser = store.getCurrentUser();
    return this.globalData.currentUser;
  }
});
