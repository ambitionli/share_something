const core = require("../../shared/core");

exports.main = async (event = {}) => {
  const state = event.state || core.createSeedState();
  const userId = event.userId || state.session.currentUserId;
  const orderId = event.orderId;

  if (!orderId) {
    throw new Error("orderId is required");
  }

  const order = core.payOrder(state, {
    userId,
    orderId
  });

  return {
    success: true,
    message: "模拟支付回调完成",
    data: order,
    state
  };
};
