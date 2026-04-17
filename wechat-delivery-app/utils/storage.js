const STORAGE_KEY = "haojin-miniapp-state";

let memoryState = null;

function hasWxStorage() {
  return typeof wx !== "undefined" && typeof wx.getStorageSync === "function";
}

function getState() {
  if (hasWxStorage()) {
    return wx.getStorageSync(STORAGE_KEY) || null;
  }
  return memoryState;
}

function setState(state) {
  if (hasWxStorage()) {
    wx.setStorageSync(STORAGE_KEY, state);
    return;
  }
  memoryState = state;
}

function clearState() {
  if (hasWxStorage()) {
    wx.removeStorageSync(STORAGE_KEY);
    return;
  }
  memoryState = null;
}

module.exports = {
  getState,
  setState,
  clearState,
  STORAGE_KEY
};
