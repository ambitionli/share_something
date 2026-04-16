const runtime = require("../shared/runtime");

exports.main = async (event) => {
  return runtime.payOrder({
    orderId: event.orderId,
    userId: event.userId,
    paymentRef: event.paymentRef,
    now: event.now
  });
};
