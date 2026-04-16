exports.main = async (event = {}) => {
  const orders = event.orders || [];
  const products = event.products || [];

  const completed = orders.filter((item) => item.status === "completed");
  const refunded = orders.filter((item) => item.status === "refunded");

  return {
    success: true,
    data: {
      orderCount: orders.length,
      completedCount: completed.length,
      refundCount: refunded.length,
      income: completed.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
      refunds: refunded.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
      activeProducts: products.filter((item) => item.onShelf).length
    }
  };
};
