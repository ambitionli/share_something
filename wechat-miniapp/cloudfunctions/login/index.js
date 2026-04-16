const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async function (event) {
  const loginType = event.loginType || 'phone';
  if (loginType === 'phone') {
    if (!/^1\d{10}$/.test(String(event.phone || ''))) {
      throw new Error('invalid phone');
    }
    const matched = await db.collection('users').where({ phone: event.phone }).get();
    if (matched.data.length) {
      return { user: matched.data[0], isNew: false };
    }
    const created = {
      phone: event.phone,
      nickname: '手机用户' + String(event.phone).slice(-4),
      role: 'user',
      balance: 0,
      couponCount: 0,
      createdAt: new Date()
    };
    const result = await db.collection('users').add({ data: created });
    return { user: Object.assign({ _id: result._id }, created), isNew: true };
  }
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  const matched = await db.collection('users').where({ openId: openId }).get();
  if (matched.data.length) {
    return { user: matched.data[0], isNew: false };
  }
  const created = {
    openId: openId,
    nickname: event.nickname || '微信用户',
    role: 'user',
    balance: 0,
    couponCount: 0,
    createdAt: new Date()
  };
  const result = await db.collection('users').add({ data: created });
  return { user: Object.assign({ _id: result._id }, created), isNew: true };
};
