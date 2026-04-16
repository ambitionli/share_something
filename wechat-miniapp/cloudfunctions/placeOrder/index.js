const { engine } = require("../common/engine");
const { loadDb, saveDb } = require("../common/store");

exports.main = async (event) => {
  const db = await loadDb();
  const result = engine.createOrder(db, {
    userId: event.userId,
    merchantId: event.merchantId,
    addressId: event.addressId,
    remark: event.remark,
    submitToken: event.submitToken
  });
  await saveDb(result.db);
  return {
    success: true,
    order: result.order,
    idempotent: result.idempotent
  };
};
