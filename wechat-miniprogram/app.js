const env = require('./config/env');
const service = require('./services/app-service');

App({
  globalData: {
    appName: env.appName,
    service,
  },

  onLaunch() {
    service.bootstrap();
  },
});
