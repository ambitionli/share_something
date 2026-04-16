const core = require("../../shared/core");

let state = core.createSeedState();

exports.main = async (event) => {
  const { userId, orderId, rating, content, images } = event;

  const review = core.submitReview(state, {
    userId,
    orderId,
    rating,
    content,
    images: images || []
  });

  return {
    success: true,
    review
  };
};
