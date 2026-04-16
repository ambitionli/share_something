const engine = require("../common/engine");
const { loadDb, saveDb } = require("../common/store");

exports.main = async (event) => {
  const db = loadDb();
  const result = engine.submitReview(db, {
    userId: event.userId,
    orderId: event.orderId,
    score: event.score,
    content: event.content,
    images: event.images || []
  });
  saveDb(result.db);
  return {
    success: true,
    review: result.review,
    order: result.order
  };
};
