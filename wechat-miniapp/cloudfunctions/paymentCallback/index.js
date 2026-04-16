const { getDb, saveDb } = require("../common/store");
const engine = require("../common/engine");

exports.main = async (event) => {
  const db = getDb();
  const result = engine.payOrder(db, {
    userId: event.userId,
    orderId: event.orderId
  });
  saveDb(result.db);
  return {
    success: true,
    order: result.order
  };
};
