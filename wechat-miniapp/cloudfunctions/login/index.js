const {
  createSeedState,
  loginWithPhone,
  loginWithWechat,
  getProfile
} = require("../../shared/core");

let state = createSeedState();

exports.main = async (event) => {
  if (event.reset) {
    state = createSeedState();
  }

  const loginType = event.loginType || "phone";
  const user =
    loginType === "wechat"
      ? loginWithWechat(state, {
          nickname: event.nickname,
          phone: event.phone
        })
      : loginWithPhone(state, {
          phone: event.phone,
          nickname: event.nickname
        });

  return {
    ok: true,
    user,
    profile: getProfile(state, user.id)
  };
};
