/**
 * 云函数调用封装
 * @param {string} action
 * @param {Record<string, unknown>} payload
 */
function call(action, payload = {}) {
  return wx.cloud.callFunction({
    name: 'lnk_api',
    data: { action, ...payload }
  }).then((res) => {
    const r = res.result;
    if (!r || r.ok !== true) {
      const msg = (r && r.message) || '请求失败';
      const err = new Error(msg);
      err.code = r && r.code;
      throw err;
    }
    return r.data;
  });
}

module.exports = {
  call
};
