const FUNCTION_MAP = {
  loginWithPhone: { name: 'login', action: 'phone' },
  loginWithWechat: { name: 'login', action: 'wechat' },
  createOrder: { name: 'placeOrder', action: 'create' },
  payOrder: { name: 'payCallback', action: 'pay' },
  requestRefund: { name: 'refund', action: 'request' },
  processRefund: { name: 'refund', action: 'process' },
  submitReview: { name: 'submitReview', action: 'submit' },
  merchantApply: { name: 'merchantOps', action: 'apply' },
  saveMerchantProduct: { name: 'merchantOps', action: 'saveProduct' },
  toggleMerchantProduct: { name: 'merchantOps', action: 'toggleProduct' },
  merchantHandleOrder: { name: 'merchantOps', action: 'handleOrder' },
  getMerchantDashboard: { name: 'stats', action: 'merchant' },
};

async function call(actionName, payload) {
  if (typeof wx === 'undefined' || !wx.cloud || !wx.cloud.callFunction) {
    throw new Error('当前环境不支持云函数调用，请先在微信开发者工具内开启云开发');
  }
  const target = FUNCTION_MAP[actionName];
  if (!target) {
    throw new Error(`云开发未映射动作：${actionName}`);
  }
  const response = await wx.cloud.callFunction({
    name: target.name,
    data: {
      action: target.action,
      payload,
    },
  });
  const result = response.result || {};
  if (!result.success) {
    throw new Error(result.message || '云函数调用失败');
  }
  return result.data;
}

module.exports = {
  call,
};
