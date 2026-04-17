const env = require("./utils/env");
const api = require("./utils/api");

App({
  globalData: {
    env,
    currentUser: null
  },

  onLaunch() {
    api.bootstrap();
    this.refreshCurrentUser();
  },

  refreshCurrentUser() {
    this.globalData.currentUser = api.getCurrentUser();
  }
});
