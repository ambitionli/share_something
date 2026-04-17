"use strict";

const runtime = require("../shared/runtime");

exports.main = async (event) => {
  return runtime.getMerchantStats({
    merchantId: event.merchantId
  });
};
