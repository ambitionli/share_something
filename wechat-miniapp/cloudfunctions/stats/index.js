const { engine } = require("../common/engine");
const { loadDb } = require("../common/store");

exports.main = async (event) => {
  const db = loadDb();
  const merchantId = event.merchantId || "";

  if (!merchantId) {
    throw new Error("缺少 merchantId");
  }

  const result = engine.getMerchantCenterData(db, {
    merchantId
  });

  return {
    code: 0,
    data: {
      merchant: result.merchant,
      stats: result.stats,
      products: result.products,
      orders: result.orders
    }
  };
};
