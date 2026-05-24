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
  webviz: {
    menu: string;
    title: string;
    subtitle: string;
    play: string;
    pause: string;
    reset: string;
    time: string;
    sceneReplay: string;
    telemetry: string;
    speed: string;
    steering: string;
    points: string;
    lidarPointCloud: string;
    nearField: string;
    highIntensity: string;
    obstacleTracking: string;
    cameraPlayback: string;
    detected: string;
    radarDetections: string;
    radarTargets: string;
    approaching: string;
    closestRange: string;
    risk: {
      danger: string;
      watch: string;
      clear: string;
    };
    obstacleKinds: {
      vehicle: string;
      pedestrian: string;
      cone: string;
      barrier: string;
    };
    obstacles: {
      leadVehicle: string;
      constructionCone: string;
      pedestrian: string;
      roadBarrier: string;
      pedestrianCrossing: string;
      parkedVehicle: string;
      laneCone: string;
    };
    cameras: {
      front: string;
      left: string;
      right: string;
      rear: string;
    };
    cameraObjects: {
      leadCar: string;
      trafficCone: string;
      buildingFacade: string;
      parkingVehicle: string;
      pedestrian: string;
      roadSign: string;
      followingCar: string;
      laneMarker: string;
      roadBarrier: string;
      laneCone: string;
    };
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
  webviz: {
    menu: '自动驾驶 Webviz',
    title: '自动驾驶回放 Webviz',
    subtitle: '回放车辆道路行驶、路侧建筑、障碍物、激光雷达点云与多路 camera 画面。',
    play: '播放',
    pause: '暂停',
    reset: '重置',
    time: '时间',
    sceneReplay: '道路场景回放',
    telemetry: '车辆遥测',
    speed: '速度',
    steering: '转角',
    points: '点云数',
    lidarPointCloud: '激光雷达点云',
    nearField: '近场点',
    highIntensity: '高反射点',
    obstacleTracking: '障碍物追踪',
    cameraPlayback: '周视 camera 回放',
    detected: '识别目标',
    radarDetections: '毫米波雷达目标',
    radarTargets: '雷达目标',
    approaching: '接近目标',
    closestRange: '最近距离',
    risk: {
      danger: '高风险',
      watch: '关注',
      clear: '正常',
    },
    obstacleKinds: {
      vehicle: '车辆',
      pedestrian: '行人',
      cone: '锥桶',
      barrier: '护栏',
    },
    obstacles: {
      leadVehicle: '前车',
      constructionCone: '施工锥桶',
      pedestrian: '行人',
      roadBarrier: '道路护栏',
      pedestrianCrossing: '横穿行人',
      parkedVehicle: '路边停放车辆',
      laneCone: '车道锥桶',
    },
    cameras: {
      front: '前视 Camera',
      left: '左视 Camera',
      right: '右视 Camera',
      rear: '后视 Camera',
    },
    cameraObjects: {
      leadCar: '前车',
      trafficCone: '交通锥',
      buildingFacade: '建筑立面',
      parkingVehicle: '停放车辆',
      pedestrian: '行人',
      roadSign: '道路标志',
      followingCar: '后车',
      laneMarker: '车道线',
      roadBarrier: '道路护栏',
      laneCone: '车道锥桶',
    },
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
