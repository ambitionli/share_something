const core = require("../../shared/core");

exports.main = async (event = {}) => {
  const state = event.state || core.createSeedState();
  const order = core.createOrder(state, {
    userId: event.userId,
    addressId: event.addressId,
    remark: event.remark,
    couponId: event.couponId
  });

  return {
    success: true,
    order,
    state
  };
};
