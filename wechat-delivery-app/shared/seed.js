const { ORDER_STATUS } = require("./constants");

function createSeedState() {
  return {
    meta: {
      version: "1.0.0",
      orderTokenHistory: [],
      nextIds: {
        user: 3,
        merchant: 3,
        product: 9,
        address: 3,
        order: 2,
        review: 1,
        coupon: 3,
        application: 1
      }
    },
    currentUserId: "user_1",
    users: [
      {
        id: "user_1",
        nickname: "小周",
        phone: "13800138000",
        avatarText: "周",
        balance: 128.5,
        couponIds: ["coupon_1", "coupon_2"]
      },
      {
        id: "user_2",
        nickname: "鲜选便利店",
        phone: "13900139000",
        avatarText: "鲜",
        balance: 0,
        couponIds: []
      }
    ],
    banners: [
      {
        id: "banner_1",
        title: "新人立减 20 元",
        subtitle: "餐饮 / 超市 / 药品 / 生鲜一站送达"
      },
      {
        id: "banner_2",
        title: "夜宵狂欢节",
        subtitle: "热门商家满 39 元减配送费"
      }
    ],
    coupons: [
      {
        id: "coupon_1",
        userId: "user_1",
        title: "新客满减券",
        amount: 8,
        minimumSpend: 30,
        isUsed: false
      },
      {
        id: "coupon_2",
        userId: "user_1",
        title: "晚高峰配送券",
        amount: 4,
        minimumSpend: 20,
        isUsed: false
      }
    ],
    merchants: [
      {
        id: "merchant_1",
        ownerUserId: "user_2",
        name: "鲜选便利店",
        category: "market",
        rating: 4.8,
        monthlySales: 1480,
        deliveryFee: 3,
        minOrderAmount: 18,
        avgDeliveryMinutes: 28,
        notice: "满 49 元赠饮料，支持退款秒审。",
        address: "科技园一路 18 号",
        logoText: "鲜",
        bannerText: "30 分钟到家",
        certifications: ["营业执照", "食品经营许可"],
        joinedAt: "2026-04-15 09:30",
        status: "approved"
      },
      {
        id: "merchant_2",
        ownerUserId: null,
        name: "本草药房",
        category: "medicine",
        rating: 4.7,
        monthlySales: 860,
        deliveryFee: 5,
        minOrderAmount: 25,
        avgDeliveryMinutes: 36,
        notice: "24 小时值守药师在线。",
        address: "安和路 66 号",
        logoText: "药",
        bannerText: "夜间送药不打烊",
        certifications: ["药品经营许可证"],
        joinedAt: "2026-04-12 13:20",
        status: "approved"
      }
    ],
    products: [
      {
        id: "product_1",
        merchantId: "merchant_1",
        name: "鲜牛奶 950ml",
        price: 16.8,
        originalPrice: 19.8,
        stock: 38,
        sales: 212,
        rating: 4.8,
        isOnShelf: true,
        description: "牧场直送，冷链配送。",
        tags: ["早餐必备", "当日达"]
      },
      {
        id: "product_2",
        merchantId: "merchant_1",
        name: "厚切吐司",
        price: 12.5,
        originalPrice: 15.0,
        stock: 42,
        sales: 168,
        rating: 4.7,
        isOnShelf: true,
        description: "低糖高纤，适合早餐。",
        tags: ["热卖", "轻食"]
      },
      {
        id: "product_3",
        merchantId: "merchant_1",
        name: "有机鸡蛋 10 枚",
        price: 21.8,
        originalPrice: 25.8,
        stock: 25,
        sales: 126,
        rating: 4.9,
        isOnShelf: true,
        description: "农场新鲜鸡蛋。",
        tags: ["生鲜", "家庭装"]
      },
      {
        id: "product_4",
        merchantId: "merchant_2",
        name: "感冒灵颗粒",
        price: 24.0,
        originalPrice: 29.0,
        stock: 30,
        sales: 98,
        rating: 4.6,
        isOnShelf: true,
        description: "常备家庭药箱。",
        tags: ["常用药", "速达"]
      },
      {
        id: "product_5",
        merchantId: "merchant_2",
        name: "创可贴 100 片",
        price: 15.5,
        originalPrice: 18.0,
        stock: 52,
        sales: 74,
        rating: 4.8,
        isOnShelf: true,
        description: "居家护理常备。",
        tags: ["护理", "家庭装"]
      }
    ],
    cartByMerchant: {},
    addresses: [
      {
        id: "address_1",
        userId: "user_1",
        receiver: "小周",
        phone: "13800138000",
        detail: "创新大厦 A 座 1702",
        tag: "公司",
        isDefault: true
      },
      {
        id: "address_2",
        userId: "user_1",
        receiver: "小周",
        phone: "13800138000",
        detail: "天际花园 8 栋 202",
        tag: "家",
        isDefault: false
      }
    ],
    orders: [
      {
        id: "order_1",
        orderNo: "HJ202604160001",
        clientToken: "demo-token-paid",
        userId: "user_1",
        merchantId: "merchant_1",
        addressId: "address_1",
        remark: "少冰，放前台",
        items: [
          {
            productId: "product_1",
            name: "鲜牛奶 950ml",
            quantity: 1,
            price: 16.8
          }
        ],
        summary: {
          itemsTotal: 16.8,
          deliveryFee: 3,
          discountAmount: 0,
          payableAmount: 19.8
        },
        status: ORDER_STATUS.DELIVERING,
        timeline: [
          { label: "订单创建", time: "2026-04-16 18:10" },
          { label: "已支付", time: "2026-04-16 18:12" },
          { label: "商家接单", time: "2026-04-16 18:15" },
          { label: "骑手配送中", time: "2026-04-16 18:25" }
        ],
        reviewId: null,
        refundReason: "",
        createdAt: "2026-04-16 18:10"
      }
    ],
    reviews: [],
    merchantApplications: [],
    support: {
      phone: "400-880-7788",
      wechat: "haojin-service"
    }
  };
}

module.exports = {
  createSeedState
};
