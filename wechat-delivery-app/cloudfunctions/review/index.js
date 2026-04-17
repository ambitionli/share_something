const runtime = require("../shared/runtime");

exports.main = async (event) => {
  return runtime.submitReview({
    userId: event.userId,
    orderId: event.orderId,
    rating: event.rating,
    content: event.content,
    images: event.images || [],
    now: event.now
  });
};
