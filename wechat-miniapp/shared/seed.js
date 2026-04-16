const ORDER_STATUS = {
  PENDING_PAYMENT: "pending_payment",
  PENDING_ACCEPT: "pending_accept",
  ACCEPTED: "accepted",
  DELIVERING: "delivering",
  COMPLETED: "completed",
  REFUND_REQUESTED: "refund_requested",
  REFUNDED: "refunded",
  REJECTED: "rejected"
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING_PAYMENT]: "待支付",
  [ORDER_STATUS.PENDING_ACCEPT]: "待接单",
  [ORDER_STATUS.ACCEPTED]: "商家已接单",
  [ORDER_STATUS.DELIVERING]: "配送中",
  [ORDER_STATUS.COMPLETED]: "已完成",
  [ORDER_STATUS.REFUND_REQUESTED]: "退款处理中",
  [ORDER_STATUS.REFUNDED]: "已退款",
  [ORDER_STATUS.REJECTED]: "已拒单"
};

const ORDER_FILTER_GROUPS = {
  all: [],
  pending_payment: [ORDER_STATUS.PENDING_PAYMENT],
  pending_accept: [ORDER_STATUS.PENDING_ACCEPT, ORDER_STATUS.ACCEPTED],
  delivering: [ORDER_STATUS.DELIVERING],
  completed: [ORDER_STATUS.COMPLETED],
  refund: [
    ORDER_STATUS.REFUND_REQUESTED,
    ORDER_STATUS.REFUNDED,
    ORDER_STATUS.REJECTED
  ]
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createSeedData() {
  return {
    meta: {
      nextIds: {
        user: 3,
        merchant: 5,
        product: 13,
        cart: 1,
        order: 1,
        review: 1,
        address: 3
      },
      nextOrderSequence: 1001,
      submitTokens: {}
    },
    banners: [
      {
        id: "banner_1",
        title: "30 分钟急速达",
        subtitle: "晚餐、药品、生鲜、日百一站式下单",
        image:
          "https://dummyimage.com/690x260/ff8a65/ffffff&text=%E9%82%BB%E9%87%8C%E5%8D%B3%E8%BE%BE"
      },
      {
        id: "banner_2",
        title: "新客立减 18 元",
        subtitle: "餐饮商家满 39 可用",
        image:
          "https://dummyimage.com/690x260/4fc3f7/ffffff&text=%E6%96%B0%E5%AE%A2%E7%A6%8F%E5%88%A9"
      }
    ],
    categories: [
      { id: "restaurant", name: "餐饮", icon: "🍜" },
      { id: "market", name: "超市", icon: "🛒" },
      { id: "pharmacy", name: "药品", icon: "💊" },
      { id: "fresh", name: "生鲜", icon: "🥬" }
    ],
    customerService: {
      phone: "400-800-7788",
      wechat: "linlijida-service"
    },
    settings: {
      notifications: true,
      orderReminders: true,
      privacyMode: false
    },
    users: [
      {
        id: "u0001",
        phone: "13800000000",
        nickname: "演示买家",
        avatarUrl:
          "https://dummyimage.com/120x120/fad390/ffffff&text=U",
        role: "user",
        merchantId: "",
        balance: 288,
        coupons: [
          {
            id: "coupon_1",
            title: "新客立减 8 元",
            amount: 8,
            minSpend: 39,
            expiresAt: "2026-12-31 23:59",
            status: "unused"
          },
          {
            id: "coupon_2",
            title: "夜宵专享 5 元",
            amount: 5,
            minSpend: 29,
            expiresAt: "2026-12-31 23:59",
            status: "unused"
          }
        ],
        createdAt: "2026-04-01 09:00"
      },
      {
        id: "u0002",
        phone: "13900000000",
        nickname: "商家演示账号",
        avatarUrl:
          "https://dummyimage.com/120x120/82b1ff/ffffff&text=M",
        role: "merchant",
        merchantId: "m0001",
        balance: 0,
        coupons: [],
        createdAt: "2026-04-01 09:05"
      }
    ],
    merchants: [
      {
        id: "m0001",
        ownerUserId: "u0002",
        name: "深夜小馆",
        category: "restaurant",
        rating: 4.8,
        sales: 1280,
        minOrder: 20,
        deliveryFee: 4,
        avgDeliveryMinutes: 28,
        description: "现炒快餐、小吃和夜宵，支持备注定制口味。",
        address: "科技园 8 号楼底商",
        notice: "满 39 减 8，晚高峰请耐心等待。",
        qualificationImages: [],
        coverImage:
          "https://dummyimage.com/220x220/fc8d62/ffffff&text=%E5%B0%8F%E9%A6%86",
        status: "active"
      },
      {
        id: "m0002",
        ownerUserId: "",
        name: "邻家优选超市",
        category: "market",
        rating: 4.6,
        sales: 860,
        minOrder: 0,
        deliveryFee: 3,
        avgDeliveryMinutes: 32,
        description: "零食酒水、日百清洁、粮油米面随买随送。",
        address: "阳光里小区北门",
        notice: "整单满 59 包邮。",
        qualificationImages: [],
        coverImage:
          "https://dummyimage.com/220x220/64b5f6/ffffff&text=%E8%B6%85%E5%B8%82",
        status: "active"
      },
      {
        id: "m0003",
        ownerUserId: "",
        name: "安心大药房",
        category: "pharmacy",
        rating: 4.9,
        sales: 530,
        minOrder: 18,
        deliveryFee: 5,
        avgDeliveryMinutes: 24,
        description: "家庭常备药、口罩、消毒用品，夜间也可下单。",
        address: "天街 2 层 219 号",
        notice: "部分药品需实名登记。",
        qualificationImages: [],
        coverImage:
          "https://dummyimage.com/220x220/81c784/ffffff&text=%E8%8D%AF%E6%88%BF",
        status: "active"
      },
      {
        id: "m0004",
        ownerUserId: "",
        name: "清晨果蔬",
        category: "fresh",
        rating: 4.7,
        sales: 942,
        minOrder: 25,
        deliveryFee: 4,
        avgDeliveryMinutes: 35,
        description: "当日蔬果、肉禽蛋奶，新鲜现配。",
        address: "湖景公寓东门",
        notice: "上午 11 点前下单优先冷链配送。",
        qualificationImages: [],
        coverImage:
          "https://dummyimage.com/220x220/a5d6a7/ffffff&text=%E7%94%9F%E9%B2%9C",
        status: "active"
      }
    ],
    products: [
      {
        id: "p0001",
        merchantId: "m0001",
        name: "招牌卤肉饭",
        price: 22,
        originalPrice: 26,
        stock: 60,
        monthlySales: 530,
        rating: 4.9,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/f8a65b/ffffff&text=%E5%8D%A4%E8%82%89%E9%A5%AD"
      },
      {
        id: "p0002",
        merchantId: "m0001",
        name: "香辣鸡腿堡套餐",
        price: 29,
        originalPrice: 35,
        stock: 48,
        monthlySales: 312,
        rating: 4.7,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/ffb74d/ffffff&text=%E5%A5%97%E9%A4%90"
      },
      {
        id: "p0003",
        merchantId: "m0001",
        name: "冰镇柠檬茶",
        price: 9,
        originalPrice: 12,
        stock: 120,
        monthlySales: 620,
        rating: 4.6,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/ffe082/ffffff&text=%E6%9F%A0%E6%AA%AC%E8%8C%B6"
      },
      {
        id: "p0004",
        merchantId: "m0002",
        name: "家庭装抽纸 12 包",
        price: 25,
        originalPrice: 32,
        stock: 80,
        monthlySales: 402,
        rating: 4.8,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/90caf9/ffffff&text=%E6%8A%BD%E7%BA%B8"
      },
      {
        id: "p0005",
        merchantId: "m0002",
        name: "大瓶可乐 2L",
        price: 8,
        originalPrice: 10,
        stock: 120,
        monthlySales: 690,
        rating: 4.7,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/42a5f5/ffffff&text=%E5%8F%AF%E4%B9%90"
      },
      {
        id: "p0006",
        merchantId: "m0002",
        name: "原味薯片",
        price: 7,
        originalPrice: 9,
        stock: 140,
        monthlySales: 410,
        rating: 4.5,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/64b5f6/ffffff&text=%E8%96%AF%E7%89%87"
      },
      {
        id: "p0007",
        merchantId: "m0003",
        name: "感冒灵颗粒",
        price: 18,
        originalPrice: 21,
        stock: 56,
        monthlySales: 208,
        rating: 4.9,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/66bb6a/ffffff&text=%E6%84%9F%E5%86%92%E7%81%B5"
      },
      {
        id: "p0008",
        merchantId: "m0003",
        name: "一次性医用口罩 50 只",
        price: 22,
        originalPrice: 28,
        stock: 96,
        monthlySales: 356,
        rating: 4.8,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/81c784/ffffff&text=%E5%8F%A3%E7%BD%A9"
      },
      {
        id: "p0009",
        merchantId: "m0003",
        name: "酒精棉片 100 片",
        price: 14,
        originalPrice: 16,
        stock: 88,
        monthlySales: 188,
        rating: 4.7,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/a5d6a7/ffffff&text=%E6%A3%89%E7%89%87"
      },
      {
        id: "p0010",
        merchantId: "m0004",
        name: "精品草莓 500g",
        price: 26,
        originalPrice: 32,
        stock: 42,
        monthlySales: 266,
        rating: 4.8,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/ef9a9a/ffffff&text=%E8%8D%89%E8%8E%93"
      },
      {
        id: "p0011",
        merchantId: "m0004",
        name: "云南蓝莓 125g",
        price: 19,
        originalPrice: 23,
        stock: 58,
        monthlySales: 198,
        rating: 4.6,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/7986cb/ffffff&text=%E8%93%9D%E8%8E%93"
      },
      {
        id: "p0012",
        merchantId: "m0004",
        name: "有机生菜 300g",
        price: 9,
        originalPrice: 12,
        stock: 66,
        monthlySales: 165,
        rating: 4.5,
        onShelf: true,
        image:
          "https://dummyimage.com/180x180/a5d6a7/ffffff&text=%E7%94%9F%E8%8F%9C"
      }
    ],
    carts: [],
    orders: [],
    reviews: [],
    addresses: [
      {
        id: "a0001",
        userId: "u0001",
        name: "张三",
        phone: "13800000000",
        city: "北京市朝阳区",
        detail: "望京街道 SOHO T3 1808",
        tag: "公司",
        isDefault: true
      },
      {
        id: "a0002",
        userId: "u0001",
        name: "张三",
        phone: "13800000000",
        city: "北京市朝阳区",
        detail: "融科橄榄城 7 号楼 2 单元 1203",
        tag: "家",
        isDefault: false
      }
    ]
  };
}

module.exports = {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_FILTER_GROUPS,
  clone,
  createSeedData
};
