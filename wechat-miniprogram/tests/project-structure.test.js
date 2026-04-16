const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const appConfig = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'));

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

test('all registered pages have js/wxml/wxss files', () => {
  appConfig.pages.forEach((page) => {
    assert.equal(exists(`${page}.js`), true, `${page}.js is missing`);
    assert.equal(exists(`${page}.wxml`), true, `${page}.wxml is missing`);
    assert.equal(exists(`${page}.wxss`), true, `${page}.wxss is missing`);
  });
});

test('required cloud functions exist', () => {
  ['login', 'placeOrder', 'payCallback', 'refund', 'submitReview', 'stats', 'merchantOps'].forEach((name) => {
    assert.equal(exists(`cloudfunctions/${name}/index.js`), true, `${name} cloud function missing`);
    assert.equal(exists(`cloudfunctions/${name}/package.json`), true, `${name} package.json missing`);
    assert.equal(exists(`cloudfunctions/${name}/lib/engine.js`), true, `${name} engine lib missing`);
    assert.equal(exists(`cloudfunctions/${name}/lib/seed.js`), true, `${name} seed lib missing`);
    assert.equal(exists(`cloudfunctions/${name}/lib/constants.js`), true, `${name} constants lib missing`);
    const indexText = fs.readFileSync(path.join(root, `cloudfunctions/${name}/index.js`), 'utf8');
    assert.equal(indexText.includes('../../shared/'), false, `${name} should not require files outside its folder`);
  });
});
