/**
 * 服务端校验（可被 Node 单测引用）
 */

function assert(cond, message, code = 'INVALID') {
  if (!cond) {
    const e = new Error(message);
    e.code = code;
    throw e;
  }
}

function validPhone(phone) {
  return /^1\d{10}$/.test(String(phone || ''));
}

function validMoney(n) {
  const x = Number(n);
  return !Number.isNaN(x) && x >= 0 && x <= 1000000 && Math.round(x * 100) === x * 100;
}

function validQty(q) {
  const x = Number(q);
  return Number.isInteger(x) && x > 0 && x <= 999;
}

function validCategory(c) {
  return ['food', 'market', 'medicine', 'fresh'].includes(c);
}

function clampStr(s, max) {
  return String(s == null ? '' : s).slice(0, max);
}

/**
 * 计算订单金额（分）并校验商品价格未被篡改
 * @param {Array<{productId:string,qty:number}>} items
 * @param {Record<string, {price:number,stock:number,status:string}>} productMap
 * @param {{deliveryFee:number,minOrderAmount:number}} merchant
 */
function mergeItems(items) {
  const map = {};
  for (const it of items || []) {
    if (!it || !it.productId) {
      continue;
    }
    const id = String(it.productId);
    const q = Math.floor(Number(it.qty) || 0);
    map[id] = (map[id] || 0) + q;
  }
  return Object.keys(map).map((k) => ({ productId: k, qty: map[k] }));
}

function buildOrderCents(items, productMap, merchant) {
  const merged = mergeItems(items);
  assert(merged.length > 0, '购物车为空');
  let subtotal = 0;
  for (const it of merged) {
    assert(it && it.productId, '商品无效');
    assert(validQty(it.qty), '数量无效');
    const p = productMap[it.productId];
    assert(p, '商品不存在');
    assert(p.status === 'on_shelf', '商品已下架');
    assert(p.stock >= it.qty, '库存不足');
    assert(validMoney(p.price), '价格异常');
    subtotal += Math.round(Number(p.price) * 100) * it.qty;
  }
  assert(validMoney(merchant.deliveryFee), '配送费异常');
  assert(validMoney(merchant.minOrderAmount), '起送价异常');
  const subYuan = subtotal / 100;
  assert(subYuan + 1e-6 >= Number(merchant.minOrderAmount), '未达起送价');
  const totalCents = subtotal + Math.round(Number(merchant.deliveryFee) * 100);
  assert(totalCents > 0 && totalCents < 100000000, '金额异常');
  return totalCents;
}

module.exports = {
  assert,
  validPhone,
  validMoney,
  validQty,
  validCategory,
  clampStr,
  mergeItems,
  buildOrderCents
};
