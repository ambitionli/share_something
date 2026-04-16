const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('all declared pages exist with js wxml wxss files', function () {
  const appJson = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));
  for (const page of appJson.pages) {
    for (const ext of ['.js', '.wxml', '.wxss']) {
      assert.equal(fs.existsSync(path.join(root, page + ext)), true, page + ext + ' should exist');
    }
  }
});

test('required cloud functions and docs exist', function () {
  const required = [
    'cloudfunctions/login/index.js',
    'cloudfunctions/placeOrder/index.js',
    'cloudfunctions/paymentNotify/index.js',
    'cloudfunctions/refundOrder/index.js',
    'cloudfunctions/submitReview/index.js',
    'cloudfunctions/stats/index.js',
    'database/schema.md',
    'docs/acceptance-report.md',
    'README.md'
  ];
  for (const file of required) {
    assert.equal(fs.existsSync(path.join(root, file)), true, file + ' should exist');
  }
});
