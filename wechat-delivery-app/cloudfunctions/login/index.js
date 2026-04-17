const runtime = require("../shared/runtime");

exports.main = async (event) => {
  if (event.type === "wechat") {
    return runtime.login({
      phone: event.phone || "13600001234",
      nickname: event.nickname || "微信访客"
    });
  }
  return runtime.login({
    phone: event.phone,
    nickname: event.nickname
  });
};
