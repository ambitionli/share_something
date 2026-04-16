/**
 * 邻刻达 — 统一云函数 API
 * 所有客户端请求通过 action 分发；关键写操作使用事务防止超卖与重复支付。
 */
const cloud = require('wx-server-sdk');
const {
  assert,
  validPhone,
  validCategory,
  clampStr,
  mergeItems,
  buildOrderCents
} = require('./common/validators.js');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * @param {{ ok: boolean, message?: string, code?: string, data?: unknown }} body
 */
function ok(data) {
  return { ok: true, data };
}

function failResponse(message, code = 'ERROR') {
  return { ok: false, message, code };
}

async function getUser(openid) {
  try {
    const r = await db.collection('users').doc(openid).get();
    return r.data || null;
  } catch (e) {
    console.error('getUser', e);
    return null;
  }
}

async function ensureUser(openid, patch) {
  const exist = await getUser(openid);
  if (exist) {
    await db.collection('users').doc(openid).update({
      data: { ...patch, updatedAt: db.serverDate() }
    });
    return { ...exist, ...patch };
  }
  const doc = {
    _id: openid,
    phone: patch.phone || '',
    nickName: patch.nickName || '邻刻达用户',
    avatarUrl: patch.avatarUrl || '',
    balance: 100,
    couponCount: 3,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  };
  await db.collection('users').add({ data: doc });
  return doc;
}

async function session(openid) {
  let user = await getUser(openid);
  if (!user) {
    user = await ensureUser(openid, {});
  }
  return ok({ openid, user });
}

async function loginPhone(openid, event) {
  const phone = clampStr(event.phone, 11);
  assert(validPhone(phone), '请输入有效手机号');
  const user = await ensureUser(openid, { phone });
  return ok({ user, openid });
}

async function loginWechat(openid, event) {
  const nickName = clampStr(event.nickName, 32);
  const avatarUrl = clampStr(event.avatarUrl, 512);
  const user = await ensureUser(openid, { nickName, avatarUrl });
  return ok({ user, openid });
}

async function merchantList(event) {
  const category = event.category ? String(event.category) : '';
  const r = await db
    .collection('merchants')
    .where({ auditStatus: 'approved' })
    .limit(200)
    .get();
  let list = r.data.slice();
  list.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  if (category && validCategory(category)) {
    list = list.filter((m) => m.category === category);
  }
  return ok(list.slice(0, 50));
}

async function merchantDetail(event) {
  const id = String(event.merchantId || '');
  assert(id, '缺少商家');
  const r = await db.collection('merchants').doc(id).get();
  assert(r.data, '商家不存在');
  assert(r.data.auditStatus === 'approved', '商家未上线');
  return ok(r.data);
}

async function productList(event) {
  const merchantId = String(event.merchantId || '');
  assert(merchantId, '缺少商家');
  const r = await db
    .collection('products')
    .where({ merchantId })
    .limit(300)
    .get();
  const list = r.data.slice();
  list.sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0));
  return ok(list.slice(0, 200));
}

async function addressList(openid) {
  const r = await db
    .collection('addresses')
    .where({ _openid: openid })
    .limit(100)
    .get();
  const list = r.data.slice();
  list.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
  return ok(list);
}

async function addressSave(openid, event) {
  const name = clampStr(event.name, 32);
  const phone = clampStr(event.phone, 11);
  const region = clampStr(event.region, 64);
  const detail = clampStr(event.detail, 120);
  assert(name && region && detail, '请填写完整地址');
  assert(validPhone(phone), '收货手机格式不正确');
  const id = event.id ? String(event.id) : '';
  const isDefault = !!event.isDefault;
  if (isDefault) {
    const others = await db.collection('addresses').where({ _openid: openid }).get();
    for (const o of others.data) {
      await db.collection('addresses').doc(o._id).update({ data: { isDefault: false } });
    }
  }
  if (id) {
    await db.collection('addresses').doc(id).update({
      data: {
        name,
        phone,
        region,
        detail,
        isDefault,
        updatedAt: db.serverDate()
      }
    });
    return ok({ id });
  }
  const add = await db.collection('addresses').add({
    data: {
      _openid: openid,
      name,
      phone,
      region,
      detail,
      isDefault,
      createdAt: db.serverDate()
    }
  });
  return ok({ id: add._id });
}

async function addressDelete(openid, event) {
  const id = String(event.id || '');
  assert(id, '缺少地址');
  const one = await db.collection('addresses').doc(id).get();
  assert(one.data && one.data._openid === openid, '无权删除');
  await db.collection('addresses').doc(id).remove();
  return ok(true);
}

async function orderList(openid, event) {
  const status = event.status ? String(event.status) : '';
  let q = db.collection('orders').where({ _openid: openid });
  if (status) {
    q = q.where({ status });
  }
  const r = await q.limit(200).get();
  const list = r.data.slice();
  list.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return ok(list.slice(0, 100));
}

async function orderDetail(openid, event) {
  const id = String(event.orderId || '');
  assert(id, '缺少订单');
  const r = await db.collection('orders').doc(id).get();
  assert(r.data, '订单不存在');
  assert(
    r.data._openid === openid || r.data.merchantOpenid === openid,
    '无权查看'
  );
  return ok(r.data);
}

/**
 * 创建订单（事务：校验库存与金额，不写库扣减，待支付）
 */
async function orderCreate(openid, event) {
  const merchantId = String(event.merchantId || '');
  const items = event.items;
  const remark = clampStr(event.remark, 200);
  const addr = event.address || {};
  assert(merchantId, '缺少商家');
  assert(addr && addr.detail, '请选择地址');

  const mdoc = await db.collection('merchants').doc(merchantId).get();
  assert(mdoc.data && mdoc.data.auditStatus === 'approved', '商家无效');
  const merchant = mdoc.data;

  const productIds = [...new Set(items.map((x) => String(x.productId)))];
  const pmap = {};
  await db.runTransaction(async (t) => {
    for (const pid of productIds) {
      const pr = await t.collection('products').doc(pid).get();
      assert(pr.data && pr.data.merchantId === merchantId, '商品不属于该商家');
      pmap[pid] = pr.data;
    }
    buildOrderCents(items, pmap, merchant);
  });

  const merged = mergeItems(items);
  assert(merged.length > 0, '购物车为空');
  const lines = merged.map((it) => {
    const p = pmap[it.productId];
    return {
      productId: it.productId,
      name: p.name,
      price: Number(p.price),
      qty: it.qty
    };
  });
  const amountCents = buildOrderCents(merged, pmap, merchant);

  const snapAddr = {
    name: clampStr(addr.name, 32),
    phone: clampStr(addr.phone, 11),
    region: clampStr(addr.region, 64),
    detail: clampStr(addr.detail, 120)
  };

  const add = await db.collection('orders').add({
    data: {
      _openid: openid,
      merchantId,
      merchantOpenid: merchant.ownerOpenid || '',
      items: lines,
      amountCents,
      deliveryFee: Number(merchant.deliveryFee),
      minOrderAmount: Number(merchant.minOrderAmount),
      remark,
      address: snapAddr,
      status: 'pending_pay',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return ok({ orderId: add._id, amountCents });
}

/**
 * 模拟支付：事务内扣减库存、幂等
 */
async function orderPay(openid, event) {
  const orderId = String(event.orderId || '');
  assert(orderId, '缺少订单');
  await db.runTransaction(async (t) => {
    const o = await t.collection('orders').doc(orderId).get();
    assert(o.data, '订单不存在');
    assert(o.data._openid === openid, '无权支付');
    assert(o.data.status === 'pending_pay', '订单状态不可支付');
    const items = o.data.items;
    const merchantId = o.data.merchantId;
    const pmap = {};
    for (const line of items) {
      const pr = await t.collection('products').doc(line.productId).get();
      assert(pr.data && pr.data.merchantId === merchantId, '商品异常');
      pmap[line.productId] = pr.data;
      assert(pr.data.stock >= line.qty, '库存不足');
    }
    const m = await t.collection('merchants').doc(merchantId).get();
    assert(m.data, '商家不存在');
    const recalc = mergeItems(items);
    const cents = buildOrderCents(recalc, pmap, m.data);
    assert(cents === o.data.amountCents, '金额异常，请重新下单');

    for (const line of items) {
      await t
        .collection('products')
        .doc(line.productId)
        .update({
          data: {
            stock: _.inc(-line.qty),
            sales: _.inc(line.qty)
          }
        });
    }
    await t.collection('orders').doc(orderId).update({
      data: {
        status: 'pending_accept',
        paidAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
  });
  return ok(true);
}

async function orderCancel(openid, event) {
  const orderId = String(event.orderId || '');
  assert(orderId, '缺少订单');
  const o = await db.collection('orders').doc(orderId).get();
  assert(o.data && o.data._openid === openid, '无权操作');
  assert(o.data.status === 'pending_pay', '当前状态不可取消');
  await db.collection('orders').doc(orderId).update({
    data: { status: 'cancelled', updatedAt: db.serverDate() }
  });
  return ok(true);
}

async function orderRefundRequest(openid, event) {
  const orderId = String(event.orderId || '');
  assert(orderId, '缺少订单');
  const o = await db.collection('orders').doc(orderId).get();
  assert(o.data && o.data._openid === openid, '无权操作');
  const s = o.data.status;
  assert(
    s === 'pending_accept' || s === 'delivering',
    '当前状态不可申请退款'
  );
  await db.collection('orders').doc(orderId).update({
    data: { status: 'refunding', updatedAt: db.serverDate() }
  });
  return ok(true);
}

async function reviewExists(openid, event) {
  const orderId = String(event.orderId || '');
  assert(orderId, '缺少订单');
  const o = await db.collection('orders').doc(orderId).get();
  assert(o.data && o.data._openid === openid, '无权查看');
  const ex = await db
    .collection('reviews')
    .where({ orderId })
    .limit(1)
    .get();
  return ok({ exists: ex.data.length > 0 });
}

async function reviewCreate(openid, event) {
  const orderId = String(event.orderId || '');
  const rating = Number(event.rating);
  const content = clampStr(event.content, 500);
  const images = Array.isArray(event.images) ? event.images.slice(0, 6) : [];
  assert(orderId, '缺少订单');
  assert(rating >= 1 && rating <= 5, '请选择星级');

  const o = await db.collection('orders').doc(orderId).get();
  assert(o.data && o.data._openid === openid, '无权评价');
  assert(o.data.status === 'completed', '订单未完成');
  const ex = await db
    .collection('reviews')
    .where({ orderId })
    .limit(1)
    .get();
  assert(ex.data.length === 0, '已评价过');

  await db.collection('reviews').add({
    data: {
      _openid: openid,
      orderId,
      merchantId: o.data.merchantId,
      rating,
      content,
      images,
      createdAt: db.serverDate()
    }
  });

  const mids = await db
    .collection('reviews')
    .where({ merchantId: o.data.merchantId })
    .get();
  const avg =
    mids.data.reduce((s, x) => s + x.rating, 0) / (mids.data.length || 1);
  await db.collection('merchants').doc(o.data.merchantId).update({
    data: { rating: Math.round(avg * 10) / 10, updatedAt: db.serverDate() }
  });

  return ok(true);
}

async function merchantRegister(openid, event) {
  const name = clampStr(event.name, 40);
  const category = String(event.category || 'food');
  const licenseImages = Array.isArray(event.licenseImages)
    ? event.licenseImages.slice(0, 6)
    : [];
  assert(name, '请填写店铺名称');
  assert(validCategory(category), '分类无效');
  const dup = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  assert(dup.data.length === 0, '您已提交过入驻申请');

  const add = await db.collection('merchants').add({
    data: {
      name,
      category,
      rating: 5,
      monthlySales: 0,
      deliveryFee: 5,
      minOrderAmount: 20,
      banner: '',
      licenseImages,
      auditStatus: 'approved',
      ownerOpenid: openid,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return ok({ merchantId: add._id });
}

async function merchantMy(openid) {
  const r = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  return ok(r.data[0] || null);
}

async function merchantProductUpsert(openid, event) {
  const mid = String(event.merchantId || '');
  const m = await db.collection('merchants').doc(mid).get();
  assert(m.data && m.data.ownerOpenid === openid, '无权操作');
  const name = clampStr(event.name, 60);
  const price = Number(event.price);
  const stock = Math.floor(Number(event.stock));
  const status = event.status === 'off_shelf' ? 'off_shelf' : 'on_shelf';
  assert(name, '请填写商品名');
  assert(!Number.isNaN(price) && price >= 0 && price <= 99999, '价格无效');
  assert(stock >= 0 && stock <= 999999, '库存无效');
  const pid = event.productId ? String(event.productId) : '';
  if (pid) {
    const p = await db.collection('products').doc(pid).get();
    assert(p.data && p.data.merchantId === mid, '商品不存在');
    await db.collection('products').doc(pid).update({
      data: {
        name,
        price,
        stock,
        status,
        updatedAt: db.serverDate()
      }
    });
    return ok({ productId: pid });
  }
  const add = await db.collection('products').add({
    data: {
      merchantId: mid,
      name,
      price,
      stock,
      sales: 0,
      status,
      image: '',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return ok({ productId: add._id });
}

async function merchantOrders(openid, event) {
  const midRow = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  assert(midRow.data.length, '您不是商家');
  const merchantId = midRow.data[0]._id;
  const status = event.status ? String(event.status) : '';
  let q = db.collection('orders').where({ merchantId });
  if (status) {
    q = q.where({ status });
  }
  const r = await q.limit(200).get();
  const list = r.data.slice();
  list.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });
  return ok(list.slice(0, 100));
}

async function merchantOrderAccept(openid, event) {
  const orderId = String(event.orderId || '');
  const accept = event.accept !== false;
  const midRow = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  assert(midRow.data.length, '您不是商家');
  const merchantId = midRow.data[0]._id;

  await db.runTransaction(async (t) => {
    const o = await t.collection('orders').doc(orderId).get();
    assert(o.data && o.data.merchantId === merchantId, '订单不存在');
    assert(o.data.status === 'pending_accept', '状态不可接单');
    if (accept) {
      await t.collection('orders').doc(orderId).update({
        data: {
          status: 'delivering',
          acceptedAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
    } else {
      const items = o.data.items;
      for (const line of items) {
        await t
          .collection('products')
          .doc(line.productId)
          .update({
            data: {
              stock: _.inc(line.qty),
              sales: _.inc(-line.qty)
            }
          });
      }
      await t.collection('orders').doc(orderId).update({
        data: {
          status: 'cancelled',
          rejectReason: clampStr(event.reason, 120),
          updatedAt: db.serverDate()
        }
      });
    }
  });
  return ok(true);
}

async function merchantOrderDeliver(openid, event) {
  const orderId = String(event.orderId || '');
  const midRow = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  assert(midRow.data.length, '您不是商家');
  const merchantId = midRow.data[0]._id;
  const o = await db.collection('orders').doc(orderId).get();
  assert(o.data && o.data.merchantId === merchantId, '订单不存在');
  assert(o.data.status === 'delivering', '状态不可完成');
  await db.collection('orders').doc(orderId).update({
    data: {
      status: 'completed',
      completedAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  await db
    .collection('merchants')
    .doc(merchantId)
    .update({
      data: {
        monthlySales: _.inc(1),
        updatedAt: db.serverDate()
      }
    });
  return ok(true);
}

async function merchantRefundHandle(openid, event) {
  const orderId = String(event.orderId || '');
  const approve = !!event.approve;
  const midRow = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  assert(midRow.data.length, '您不是商家');
  const merchantId = midRow.data[0]._id;

  await db.runTransaction(async (t) => {
    const o = await t.collection('orders').doc(orderId).get();
    assert(o.data && o.data.merchantId === merchantId, '订单不存在');
    assert(o.data.status === 'refunding', '不在退款处理中');
    if (approve) {
      const items = o.data.items;
      for (const line of items) {
        await t
          .collection('products')
          .doc(line.productId)
          .update({
            data: {
              stock: _.inc(line.qty),
              sales: _.inc(-line.qty)
            }
          });
      }
      await t.collection('orders').doc(orderId).update({
        data: {
          status: 'refunded',
          refundedAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
    } else {
      await t.collection('orders').doc(orderId).update({
        data: {
          status: 'delivering',
          updatedAt: db.serverDate()
        }
      });
    }
  });
  return ok(true);
}

async function seedDemo() {
  const mid = 'seed_merchant_001';
  const exist = await db.collection('merchants').doc(mid).get();
  if (exist.data) {
    return ok({ seeded: false, message: '演示数据已存在', merchantId: mid });
  }
  await db
    .collection('merchants')
    .doc(mid)
    .set({
      data: {
        name: '邻刻达演示餐厅',
        category: 'food',
        rating: 4.8,
        monthlySales: 128,
        deliveryFee: 5,
        minOrderAmount: 20,
        banner: '',
        auditStatus: 'approved',
        ownerOpenid: '__seed_demo_owner__',
        licenseImages: [],
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
  const products = [
    {
      id: 'seed_prod_001',
      name: '招牌卤肉饭',
      price: 18,
      stock: 200
    },
    {
      id: 'seed_prod_002',
      name: '清爽蔬菜沙拉',
      price: 15,
      stock: 80
    },
    {
      id: 'seed_prod_003',
      name: '鲜榨橙汁',
      price: 12,
      stock: 150
    },
    {
      id: 'seed_prod_004',
      name: '家庭药品急救包（演示）',
      price: 39,
      stock: 30
    }
  ];
  for (const p of products) {
    await db
      .collection('products')
      .doc(p.id)
      .set({
        data: {
          merchantId: mid,
          name: p.name,
          price: p.price,
          stock: p.stock,
          sales: 0,
          status: 'on_shelf',
          image: '',
          createdAt: db.serverDate(),
          updatedAt: db.serverDate()
        }
      });
  }
  return ok({ seeded: true, merchantId: mid });
}

async function statsMerchant(openid) {
  const midRow = await db
    .collection('merchants')
    .where({ ownerOpenid: openid })
    .limit(1)
    .get();
  if (!midRow.data.length) {
    return ok({ sales: 0, revenueCents: 0, refunds: 0 });
  }
  const merchantId = midRow.data[0]._id;
  const orders = await db
    .collection('orders')
    .where({ merchantId })
    .limit(500)
    .get();
  let revenueCents = 0;
  let refunds = 0;
  let sales = 0;
  for (const o of orders.data) {
    if (o.status === 'completed') {
      revenueCents += o.amountCents || 0;
      sales += 1;
    }
    if (o.status === 'refunded') {
      refunds += 1;
    }
  }
  return ok({ sales, revenueCents, refunds });
}

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) {
    return failResponse('未获取到登录态，请在小程序端发起云开发', 'NO_OPENID');
  }

  const action = String(event.action || '');

  try {
    switch (action) {
      case 'session':
        return await session(openid);
      case 'login_phone':
        return await loginPhone(openid, event);
      case 'login_wechat':
        return await loginWechat(openid, event);
      case 'merchant_list':
        return await merchantList(event);
      case 'merchant_detail':
        return await merchantDetail(event);
      case 'product_list':
        return await productList(event);
      case 'address_list':
        return await addressList(openid);
      case 'address_save':
        return await addressSave(openid, event);
      case 'address_delete':
        return await addressDelete(openid, event);
      case 'order_list':
        return await orderList(openid, event);
      case 'order_detail':
        return await orderDetail(openid, event);
      case 'order_create':
        return await orderCreate(openid, event);
      case 'order_pay':
        return await orderPay(openid, event);
      case 'order_cancel':
        return await orderCancel(openid, event);
      case 'order_refund_request':
        return await orderRefundRequest(openid, event);
      case 'review_exists':
        return await reviewExists(openid, event);
      case 'review_create':
        return await reviewCreate(openid, event);
      case 'merchant_register':
        return await merchantRegister(openid, event);
      case 'merchant_my':
        return await merchantMy(openid);
      case 'merchant_product_upsert':
        return await merchantProductUpsert(openid, event);
      case 'merchant_orders':
        return await merchantOrders(openid, event);
      case 'merchant_order_accept':
        return await merchantOrderAccept(openid, event);
      case 'merchant_order_deliver':
        return await merchantOrderDeliver(openid, event);
      case 'merchant_refund_handle':
        return await merchantRefundHandle(openid, event);
      case 'stats_merchant':
        return await statsMerchant(openid);
      case 'seed_demo':
        return await seedDemo();
      default:
        return failResponse('未知 action: ' + action, 'UNKNOWN_ACTION');
    }
  } catch (e) {
    console.error('lnk_api error', e);
    return failResponse(e.message || '服务器错误', e.code || 'ERROR');
  }
};
