function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
function ensurePhone(phone) {
  invariant(/^1\d{10}$/.test(String(phone || '')), '请输入合法手机号');
}
function ensurePositiveMoney(value, fieldName) {
  invariant(Number(value) > 0, fieldName + '必须大于0');
}
function ensureNonNegativeInt(value, fieldName) {
  invariant(Number.isInteger(Number(value)) && Number(value) >= 0, fieldName + '必须是非负整数');
}
function ensureNonEmptyString(value, fieldName) {
  invariant(String(value || '').trim().length > 0, fieldName + '不能为空');
}
module.exports = { invariant, ensurePhone, ensurePositiveMoney, ensureNonNegativeInt, ensureNonEmptyString };
