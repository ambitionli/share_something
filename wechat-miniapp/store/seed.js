function createSeedState() {
  var now = new Date().toISOString();
  return {
    meta: {
      createdAt: now,
      version: '1.0.0',
      mode: 'local-mock'
    },
    currentUserId: 'user_buyer_1',
    categories: ['全部', '餐饮', '超市', '药品', '生鲜'],
    banners: [
      { id: 'banner_1', title: '30分钟送达的本地生活服务', subtitle: '演示模式默认启用本地 Mock 数据，可直接运行。' },
      { id: 'banner_2', title: '商家入驻、下单、配送、退款一体化', subtitle: '支持用户端、商家端、云函数和验收脚本全链路演示。' }
    ],
    users: [
      {
        id: 'user_buyer_1', phone: '18800000001', nickname: '演示用户', avatarText: 'U1', role: 'user', balance: 128.5, couponCount: 3,
        openId: 'wx_demo_buyer', settings: { messageNotice: true, darkMode: false }
      },
      {
        id: 'user_merchant_1', phone: '18800000002', nickname: '鲜食掌柜', avatarText: 'M1', role: 'merchant', balance: 0, couponCount: 0,
        openId: 'wx_demo_merchant_1', settings: { messageNotice: true, darkMode: false }
      },
      {
        id: 'user_merchant_2', phone: '18800000003', nickname: '药房掌柜', avatarText: 'M2', role: 'merchant', balance: 0, couponCount: 0,
        openId: 'wx_demo_merchant_2', settings: { messageNotice: true, darkMode: false }
      }
    ],
    merchants: [
      { id: 'merchant_food', ownerUserId: 'user_merchant_1', name: '即刻鲜食', category: '餐饮', rating: 4.8, deliveryFee: 4, minOrderAmount: 20, sales: 1280, status: 'active', notice: '现炒现做，晚高峰请耐心等待。', qualificationImages: ['food-license.png'], monthlyIncome: 18650 },
      { id: 'merchant_market', ownerUserId: 'system_market', name: '邻里超市', category: '超市', rating: 4.6, deliveryFee: 3, minOrderAmount: 15, sales: 820, status: 'active', notice: '酒水零食日用品，支持夜间配送。', qualificationImages: ['market-license.png'], monthlyIncome: 12300 },
      { id: 'merchant_pharmacy', ownerUserId: 'user_merchant_2', name: '安心大药房', category: '药品', rating: 4.9, deliveryFee: 5, minOrderAmount: 30, sales: 540, status: 'active', notice: '夜间在线，常备感冒和退烧药。', qualificationImages: ['pharmacy-license.png'], monthlyIncome: 14320 },
      { id: 'merchant_fresh', ownerUserId: 'system_fresh', name: '晨鲜生鲜', category: '生鲜', rating: 4.7, deliveryFee: 6, minOrderAmount: 35, sales: 910, status: 'active', notice: '每日清晨补货，鲜果海鲜当天达。', qualificationImages: ['fresh-license.png'], monthlyIncome: 20100 }
    ],
    products: [
      { id: 'product_1', merchantId: 'merchant_food', name: '招牌牛肉饭', description: '现炒牛肉配时蔬和溏心蛋。', price: 26, stock: 80, soldCount: 560, status: 'on', unit: '份' },
      { id: 'product_2', merchantId: 'merchant_food', name: '番茄肥牛面', description: '酸甜番茄汤底，适合夜宵。', price: 22, stock: 65, soldCount: 410, status: 'on', unit: '份' },
      { id: 'product_3', merchantId: 'merchant_market', name: '高钙纯牛奶', description: '250ml*12盒家庭装。', price: 42, stock: 120, soldCount: 230, status: 'on', unit: '箱' },
      { id: 'product_4', merchantId: 'merchant_market', name: '矿泉水', description: '550ml*24瓶，居家常备。', price: 28, stock: 160, soldCount: 380, status: 'on', unit: '箱' },
      { id: 'product_5', merchantId: 'merchant_pharmacy', name: '感冒灵颗粒', description: '常用感冒药，演示商品。', price: 36, stock: 50, soldCount: 145, status: 'on', unit: '盒' },
      { id: 'product_6', merchantId: 'merchant_pharmacy', name: '维生素C泡腾片', description: '补充维生素，柠檬口味。', price: 24, stock: 95, soldCount: 188, status: 'on', unit: '瓶' },
      { id: 'product_7', merchantId: 'merchant_fresh', name: '山东红富士苹果', description: '脆甜多汁，5斤装。', price: 29, stock: 72, soldCount: 260, status: 'on', unit: '箱' },
      { id: 'product_8', merchantId: 'merchant_fresh', name: '三文鱼切片', description: '冷链配送，适合刺身和香煎。', price: 68, stock: 28, soldCount: 98, status: 'on', unit: '份' }
    ],
    cartItems: [],
    addresses: [
      { id: 'address_1', userId: 'user_buyer_1', contactName: '张三', phone: '18800000001', detail: '朝阳区望京演示园区 8 号楼 1001', tag: '公司', isDefault: true }
    ],
    orders: [], reviews: [], merchantApplications: [],
    customerService: { phone: '400-800-7000', wechat: 'neolife-service', onlineTime: '08:00-23:30' }
  };
}
module.exports = { createSeedState };
