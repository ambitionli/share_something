/**
 * Node 单元测试：校验合并行项目、金额与库存规则
 * 运行：node tests/validators.test.js
 */
const assert = require('assert');
const {
  mergeItems,
  buildOrderCents,
  assert: assertFn
} = require('../cloudfunctions/lnk_api/common/validators.js');

function throws(fn, msgSubstr) {
  try {
    fn();
    assert.fail('expected throw');
  } catch (e) {
    if (msgSubstr) {
      assert.ok(
        String(e.message).includes(msgSubstr),
        'message: ' + e.message
      );
    }
  }
}

// mergeItems
const m1 = mergeItems([
  { productId: 'a', qty: 1 },
  { productId: 'a', qty: 2 },
  { productId: 'b', qty: 1 }
]);
assert.deepStrictEqual(
  m1.sort((x, y) => x.productId.localeCompare(y.productId)),
  [
    { productId: 'a', qty: 3 },
    { productId: 'b', qty: 1 }
  ]
);

const pmap = {
  a: { price: 10, stock: 10, status: 'on_shelf' },
  b: { price: 5, stock: 2, status: 'on_shelf' }
};
const merchant = { deliveryFee: 2, minOrderAmount: 15 };
const cents = buildOrderCents(
  [
    { productId: 'a', qty: 1 },
    { productId: 'b', qty: 2 }
  ],
  pmap,
  merchant
);
assert.strictEqual(cents, 10 * 100 + 2 * 5 * 100 + 2 * 100);

throws(
  () =>
    buildOrderCents([{ productId: 'a', qty: 100 }], pmap, {
      deliveryFee: 0,
      minOrderAmount: 0
    }),
  '库存不足'
);

throws(
  () =>
    assertFn(false, 'x'),
  'x'
);

console.log('validators.test.js: OK');
