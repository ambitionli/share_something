"use strict";

const runtime = require("../shared/runtime");

exports.main = async (event) => {
  return runtime.processRefund({
    userId: event.userId,
    merchantUserId: event.merchantUserId,
    orderId: event.orderId,
    reason: event.reason || "用户申请退款",
    approve: event.approve,
    now: event.now
  });
};
