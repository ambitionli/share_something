const { STATUS_LABELS } = require("../shared/core");

function price(value) {
  return Number(value || 0).toFixed(2);
}

function statusLabel(status) {
  return STATUS_LABELS[status] || status;
}

function clip(text, length) {
  const content = text || "";
  if (content.length <= length) {
    return content;
  }
  return `${content.slice(0, length)}...`;
}

module.exports = {
  price,
  statusLabel,
  clip
};
