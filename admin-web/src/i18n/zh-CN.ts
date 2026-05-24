/**
 * 共享文案结构（中英文键一致，值为 string）
 */
export interface TranslationResources {
  common: {
    appName: string;
    sidebar: string;
    header: string;
    actions: {
      add: string;
      edit: string;
      delete: string;
      save: string;
      cancel: string;
      confirm: string;
      search: string;
      reset: string;
      upload: string;
      back: string;
    };
  };
  auth: {
    login: string;
    phone: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
  };
  dashboard: {
    totalOrders: string;
    totalProducts: string;
    totalUsers: string;
    todayOrders: string;
    revenue: string;
  };
  autonomy: {
    menu: string;
    title: string;
    subtitle: string;
    badge: string;
    controls: {
      play: string;
      pause: string;
      timeline: string;
    };
    stats: {
      speed: string;
      points: string;
      obstacles: string;
    };
    scene: {
      title: string;
      lidar: string;
    };
    camera: {
      replay: string;
      objects: string;
    };
  };
  company: {
    title: string;
    description: string;
    photos: string;
    news: string;
    publish: string;
    draft: string;
    coverImage: string;
  };
  products: {
    name: string;
    description: string;
    price: string;
    stock: string;
    images: string;
    onShelf: string;
    offShelf: string;
    allProducts: string;
  };
  orders: {
    orderNumber: string;
    buyer: string;
    amount: string;
    status: string;
    paymentMethod: string;
    tracking: string;
    expressCompany: string;
    ship: string;
    confirmReceipt: string;
    management: string;
    buyerPhone: string;
    createdAt: string;
    actions: string;
    filterAll: string;
    pay: string;
    shipSuccess: string;
    columnId: string;
  };
  orderStatus: {
    pending: string;
    paid: string;
    shipped: string;
    completed: string;
    cancelled: string;
  };
  users: {
    phone: string;
    nickname: string;
    role: string;
    admin: string;
    buyer: string;
    registrationTime: string;
  };
  upload: {
    selectFile: string;
    uploading: string;
    uploadSuccess: string;
    uploadFailed: string;
    fileTooLarge: string;
    unsupportedFormat: string;
  };
  messages: {
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    operationFailed: string;
    confirmDelete: string;
  };
}

/** 简体中文 */
export const zhCN: TranslationResources = {
  common: {
    appName: '分享好物',
    sidebar: '侧边栏',
    header: '顶栏',
    actions: {
      add: '新增',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      confirm: '确认',
      search: '搜索',
      reset: '重置',
      upload: '上传',
      back: '返回',
    },
  },
  auth: {
    login: '登录',
    phone: '手机号',
    password: '密码',
    rememberMe: '记住我',
    forgotPassword: '忘记密码',
  },
  dashboard: {
    totalOrders: '订单总数',
    totalProducts: '商品总数',
    totalUsers: '用户总数',
    todayOrders: '今日订单',
    revenue: '营收',
  },
  autonomy: {
    menu: '自动驾驶回放',
    title: '自动驾驶 WebViz 回放',
    subtitle: '同步展示道路场景、车辆轨迹、建筑物、障碍物、LiDAR 点云与四路相机回放。',
    badge: '传感器回放',
    controls: {
      play: '播放',
      pause: '暂停',
      timeline: '回放时间轴',
    },
    stats: {
      speed: '自车速度',
      points: 'LiDAR 点数',
      obstacles: '障碍物',
    },
    scene: {
      title: '道路与点云场景',
      lidar: 'LiDAR 点云',
    },
    camera: {
      replay: '录像回放',
      objects: '目标',
    },
  },
  company: {
    title: '标题',
    description: '描述',
    photos: '图片',
    news: '动态',
    publish: '发布',
    draft: '草稿',
    coverImage: '封面图',
  },
  products: {
    name: '名称',
    description: '描述',
    price: '价格',
    stock: '库存',
    images: '图片',
    onShelf: '上架',
    offShelf: '下架',
    allProducts: '全部商品',
  },
  orders: {
    orderNumber: '订单号',
    buyer: '买家',
    amount: '金额',
    status: '状态',
    paymentMethod: '支付方式',
    tracking: '物流单号',
    expressCompany: '快递公司',
    ship: '发货',
    confirmReceipt: '确认收货',
    management: '订单管理',
    buyerPhone: '买家手机',
    createdAt: '下单时间',
    actions: '操作',
    filterAll: '全部状态',
    pay: '去支付',
    shipSuccess: '发货成功',
    columnId: 'ID',
  },
  orderStatus: {
    pending: '待付款',
    paid: '已付款',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消',
  },
  users: {
    phone: '手机号',
    nickname: '昵称',
    role: '角色',
    admin: '管理员',
    buyer: '买家',
    registrationTime: '注册时间',
  },
  upload: {
    selectFile: '选择文件',
    uploading: '上传中',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    fileTooLarge: '文件过大',
    unsupportedFormat: '不支持的格式',
  },
  messages: {
    createSuccess: '创建成功',
    updateSuccess: '更新成功',
    deleteSuccess: '删除成功',
    operationFailed: '操作失败',
    confirmDelete: '确定要删除吗？',
  },
};
