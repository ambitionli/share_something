const core = require("../../shared/core");

exports.main = async (event) => {
  const state = event.state || core.createSeedState();
  const requested = core.requestRefund(state, {
    userId: event.userId,
    orderId: event.orderId,
    reason: event.reason || "用户申请退款"
  });
  const processed = core.processRefund(state, { orderId: event.orderId });
  return {
    ok: true,
    requested,
    processed,
    state
  };
};
