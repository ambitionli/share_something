function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}
function formatMoney(value) {
  return roundMoney(value).toFixed(2);
}
function sumBy(list, getter) {
  return roundMoney((list || []).reduce(function (total, item) {
    return total + Number(getter(item) || 0);
  }, 0));
}
module.exports = { roundMoney, formatMoney, sumBy };
