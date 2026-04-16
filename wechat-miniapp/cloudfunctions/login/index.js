const cloud = require("wx-server-sdk");
const { engine } = require("../common/engine");
const { loadDb, saveDb } = require("../common/store");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event) => {
  const db = await loadDb(cloud);
  let result;

  if (event.type === "wechat") {
    result = engine.loginWithWechat(db);
  } else {
    result = engine.loginWithPhone(db, {
      phone: event.phone,
      code: event.code
    });
  }

  await saveDb(cloud, result.db);
  return {
    success: true,
    user: result.user
  };
};
