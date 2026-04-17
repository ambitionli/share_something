const runtime = require("../shared/runtime");

exports.main = async (event) => {
  return runtime.createOrder(event);
};
