const { ORDER_STATUS_LABELS } = require("../shared/seed");

function formatMoney(value) {
  return `¥${Number(value || 0).toFixed(2)}`;
}

function formatPrice(value) {
  return formatMoney(value);
}

function formatStatus(status) {
  return ORDER_STATUS_LABELS[status] || status || "";
}

function buildSubmitToken() {
  return `submit_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

module.exports = {
  formatMoney,
  formatPrice,
  formatStatus,
  buildSubmitToken
};
