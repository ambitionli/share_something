const { engine } = require("../common/engine");
const { loadDb, saveDb } = require("../common/store");

exports.main = async (event) => {
  const db = loadDb();
  let result;

  if (event.action === "request") {
    result = engine.requestRefund(db, {
      userId: event.userId,
      orderId: event.orderId,
      reason: event.reason
    });
  } else if (event.action === "process") {
    result = engine.processRefund(db, {
      merchantId: event.merchantId,
      orderId: event.orderId,
      approve: Boolean(event.approve),
      reason: event.reason
    });
  } else {
    throw new Error("不支持的退款动作");
  }

  saveDb(result.db);
  return result;
};
