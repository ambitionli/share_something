const seed = require('./seed');
const STORAGE_KEY = 'NEO_LIFE_LOCAL_STATE';
let stateCache = null;
function deepClone(value) { return JSON.parse(JSON.stringify(value)); }
function canUseWxStorage() {
  return typeof wx !== 'undefined' && wx && typeof wx.getStorageSync === 'function' && typeof wx.setStorageSync === 'function';
}
function loadState() {
  if (stateCache) { return stateCache; }
  if (canUseWxStorage()) {
    const saved = wx.getStorageSync(STORAGE_KEY);
    if (saved && saved.meta && saved.meta.version) {
      stateCache = saved;
      return stateCache;
    }
  }
  stateCache = seed.createSeedState();
  persistState();
  return stateCache;
}
function persistState() {
  if (canUseWxStorage()) {
    wx.setStorageSync(STORAGE_KEY, stateCache);
  }
}
function getState() { return loadState(); }
function updateState(mutator) {
  const draft = deepClone(loadState());
  mutator(draft);
  stateCache = draft;
  persistState();
  return deepClone(stateCache);
}
function resetState() {
  stateCache = seed.createSeedState();
  persistState();
  return deepClone(stateCache);
}
function setState(nextState) {
  stateCache = deepClone(nextState);
  persistState();
  return deepClone(stateCache);
}
module.exports = { STORAGE_KEY, deepClone, getState, updateState, resetState, setState };
