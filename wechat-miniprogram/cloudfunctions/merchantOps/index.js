const engine = require('./lib/engine');
const { createSeedState } = require('./lib/seed');

let cloudState = createSeedState();

function run(action, payload) {
  if (action === 'phone') {
    return engine.loginWithPhone(cloudState, payload || {});
  }
  if (action === 'wechat') {
    return engine.loginWithWechat(cloudState, payload || {});
  }
  if (action === 'create') {
    return engine.createOrder(cloudState, payload || {});
  }
  if (action === 'pay') {
    return engine.payOrder(cloudState, payload || {});
  }
  if (action === 'request') {
    return engine.requestRefund(cloudState, payload || {});
  }
  if (action === 'process') {
    return engine.processRefund(cloudState, payload || {});
  }
  if (action === 'submit') {
    return engine.submitReview(cloudState, payload || {});
  }
  if (action === 'apply') {
    return engine.merchantApply(cloudState, payload || {});
  }
  if (action === 'saveProduct') {
    return engine.saveMerchantProduct(cloudState, payload || {});
  }
  if (action === 'toggleProduct') {
    return engine.toggleMerchantProduct(cloudState, payload || {});
  }
  if (action === 'handleOrder') {
    return engine.merchantHandleOrder(cloudState, payload || {});
  }
  if (action === 'merchant') {
    return engine.getMerchantDashboard(cloudState, payload || {});
  }
  throw new Error(`unsupported action: ${action}`);
}

exports.main = async (event) => {
  try {
    return {
      success: true,
      data: run(event.action, event.payload),
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      code: error.code || 'UNKNOWN',
    };
  }
};
