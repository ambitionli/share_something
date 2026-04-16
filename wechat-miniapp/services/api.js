const { createSeedData } = require("../shared/seed");
const engine = require("../shared/order-engine");
const { buildSubmitToken } = require("../utils/format");

function getAppSafe() {
  try {
    return getApp();
  } catch (error) {
    return null;
  }
}

function getDbKey() {
  const app = getAppSafe();
  return (app && app.globalData && app.globalData.dbKey) || "delivery-miniapp-db-v1";
}

function loadDb() {
  const cache = wx.getStorageSync(getDbKey());
  if (cache && cache.users) {
    return cache;
  }
  const seed = createSeedData();
  wx.setStorageSync(getDbKey(), seed);
  return seed;
}

function saveDb(db) {
  wx.setStorageSync(getDbKey(), db);
}

function getCurrentUser() {
  const app = getAppSafe();
  return (app && app.globalData && app.globalData.currentUser) || null;
}

function setCurrentUser(user) {
  const app = getAppSafe();
  if (app && typeof app.setCurrentUser === "function") {
    app.setCurrentUser(user);
  }
}

function clearCurrentUser() {
  const app = getAppSafe();
  if (app && typeof app.clearCurrentUser === "function") {
    app.clearCurrentUser();
  }
}

function requireCurrentUser() {
  const user = getCurrentUser();
  if (!user || !user.id) {
    throw new Error("请先登录");
  }
  return user;
}

function run(operation) {
  try {
    const db = loadDb();
    const result = operation(db);
    if (result && result.db) {
      saveDb(result.db);
      delete result.db;
    }
    return Promise.resolve(result);
  } catch (error) {
    return Promise.reject(error);
  }
}

function refreshSessionUser() {
  const current = getCurrentUser();
  if (!current || !current.id) {
    return null;
  }
  const db = loadDb();
  const next = db.users.find((item) => item.id === current.id) || null;
  if (next) {
    setCurrentUser(next);
  }
  return next;
}

function getAddressById(userId, addressId) {
  const db = loadDb();
  return db.addresses.find(
    (item) => item.userId === userId && item.id === addressId
  ) || null;
}

module.exports = {
  getCurrentUser,
  clearCurrentUser,
  resetDemoData() {
    const seed = createSeedData();
    saveDb(seed);
    const buyer = seed.users.find((item) => item.id === "u0001");
    setCurrentUser(buyer);
    return Promise.resolve({ user: buyer });
  },
  loginWithPhone(phone, code) {
    return run((db) => {
      const result = engine.loginWithPhone(db, { phone, code });
      setCurrentUser(result.user);
      return result;
    });
  },
  loginWithWechat() {
    return run((db) => {
      const result = engine.loginWithWechat(db);
      setCurrentUser(result.user);
      return result;
    });
  },
  getHomeData(keyword, category) {
    return run((db) => engine.getHomeData(db, { keyword, category }));
  },
  getMerchantDetail(merchantId) {
    const user = getCurrentUser();
    return run((db) =>
      engine.getMerchantDetail(db, {
        merchantId,
        userId: user ? user.id : ""
      })
    );
  },
  getMerchantById(merchantId) {
    const db = loadDb();
    return db.merchants.find((item) => item.id === merchantId) || null;
  },
  listCart() {
    const user = requireCurrentUser();
    return run((db) => engine.listCart(db, user.id));
  },
  getCheckoutSummary(merchantId) {
    const user = getCurrentUser();
    if (!user || !user.id) {
      return null;
    }
    const db = loadDb();
    const carts = engine.listCart(db, user.id).carts;
    if (!merchantId) {
      return carts[0] || null;
    }
    return carts.find((item) => item.merchantId === merchantId) || null;
  },
  updateCartItem(merchantId, productId, delta) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.updateCartItem(db, {
        userId: user.id,
        merchantId,
        productId,
        delta
      })
    );
  },
  clearCart(merchantId) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.clearCart(db, {
        userId: user.id,
        merchantId
      })
    );
  },
  getProfile() {
    const user = requireCurrentUser();
    return run((db) => engine.buildProfile(db, user.id));
  },
  listAddresses() {
    const user = requireCurrentUser();
    const db = loadDb();
    return db.addresses
      .filter((item) => item.userId === user.id)
      .sort((left, right) => Number(right.isDefault) - Number(left.isDefault));
  },
  saveAddress(address) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.saveAddress(db, {
        userId: user.id,
        address
      })
    );
  },
  addAddress(_userId, address) {
    const payload =
      address && typeof address === "object" ? address : _userId;
    return this.saveAddress(payload);
  },
  setDefaultAddress(addressId) {
    const user = requireCurrentUser();
    const address = getAddressById(user.id, addressId);
    if (!address) {
      return Promise.reject(new Error("地址不存在"));
    }
    return this.saveAddress(
      Object.assign({}, address, {
        isDefault: true
      })
    );
  },
  deleteAddress(addressId) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.deleteAddress(db, {
        userId: user.id,
        addressId
      })
    );
  },
  createOrder(payload) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.createOrder(db, {
        userId: user.id,
        merchantId: payload.merchantId,
        addressId: payload.addressId,
        remark: payload.remark,
        submitToken: payload.submitToken || buildSubmitToken()
      })
    );
  },
  placeOrder(payload) {
    return this.createOrder(payload);
  },
  payOrder(orderId) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.payOrder(db, {
        userId: user.id,
        orderId
      })
    );
  },
  listOrders(statusGroup) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.listOrders(db, {
        userId: user.id,
        statusGroup: statusGroup || "all"
      })
    );
  },
  getOrderDetail(orderId) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.getOrderDetail(db, {
        userId: user.id,
        orderId
      })
    );
  },
  confirmOrder(orderId) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.confirmOrder(db, {
        userId: user.id,
        orderId
      })
    );
  },
  requestRefund(orderId, reason) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.requestRefund(db, {
        userId: user.id,
        orderId,
        reason
      })
    );
  },
  submitReview(payload) {
    const user = requireCurrentUser();
    return run((db) =>
      engine.submitReview(db, {
        userId: user.id,
        orderId: payload.orderId,
        score: payload.score,
        content: payload.content,
        images: payload.images
      })
    );
  },
  joinMerchant(form) {
    const user = requireCurrentUser();
    return run((db) => {
      const result = engine.merchantJoin(db, {
        userId: user.id,
        form
      });
      refreshSessionUser();
      return result;
    });
  },
  listMerchantProducts() {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.listMerchantProducts(db, {
        merchantId: user.merchantId
      })
    );
  },
  upsertProduct(product) {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.upsertProduct(db, {
        merchantId: user.merchantId,
        product
      })
    );
  },
  toggleProductShelf(productId, onShelf) {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.toggleProductShelf(db, {
        merchantId: user.merchantId,
        productId,
        onShelf
      })
    );
  },
  listMerchantOrders() {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.listMerchantOrders(db, {
        merchantId: user.merchantId
      })
    );
  },
  getMerchantCenterData() {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.getMerchantCenterData(db, {
        merchantId: user.merchantId
      })
    );
  },
  merchantAcceptOrder(orderId) {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.merchantAcceptOrder(db, {
        merchantId: user.merchantId,
        orderId
      })
    );
  },
  merchantRejectOrder(orderId, reason) {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.merchantRejectOrder(db, {
        merchantId: user.merchantId,
        orderId,
        reason
      })
    );
  },
  merchantDispatchOrder(orderId) {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.merchantDispatchOrder(db, {
        merchantId: user.merchantId,
        orderId
      })
    );
  },
  processRefund(orderId, approve, reason) {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.processRefund(db, {
        merchantId: user.merchantId,
        orderId,
        approve,
        reason
      })
    );
  },
  getMerchantStats() {
    const user = requireCurrentUser();
    if (!user.merchantId) {
      return Promise.reject(new Error("请先完成商家入驻"));
    }
    return run((db) =>
      engine.getMerchantStats(db, {
        merchantId: user.merchantId
      })
    );
  }
};
