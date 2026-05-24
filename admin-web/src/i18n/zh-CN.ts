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
  webviz: {
    menu: string;
    title: string;
    subtitle: string;
    speed: string;
    obstacles: string;
    lidarPoints: string;
    radarDetections: string;
    nearestObstacle: string;
    play: string;
    pause: string;
    frame: string;
    cameras: string;
    bevTitle: string;
    bevAria: string;
    building: string;
    ego: string;
    recording: string;
    objects: string;
    cameraFront: string;
    cameraLeft: string;
    cameraRight: string;
    cameraRear: string;
    obstacleSedan: string;
    obstaclePedestrian: string;
    obstacleCones: string;
    obstacleBarrier: string;
    obstacleCyclist: string;
    obstacleShortVehicle: string;
    obstacleShortPedestrian: string;
    obstacleShortCone: string;
    obstacleShortBarrier: string;
    obstacleShortCyclist: string;
    fov: string;
    degreeUnit: string;
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
  webviz: {
    menu: '自动驾驶 Webviz',
    title: '自动驾驶回放 Webviz',
    subtitle: '回放车端融合感知：道路、车辆轨迹、建筑物、障碍物、激光雷达点云与四路 camera 录像。',
    speed: '车速',
    obstacles: '障碍物',
    lidarPoints: '点云点数',
    radarDetections: '雷达目标',
    nearestObstacle: '最近障碍物',
    play: '播放',
    pause: '暂停',
    frame: '帧',
    cameras: '路 Camera',
    bevTitle: 'LiDAR / Radar / BEV',
    bevAria: '自动驾驶回放鸟瞰图',
    building: '建筑',
    ego: '主车',
    recording: '录制中',
    objects: '个目标',
    cameraFront: '前视 Camera',
    cameraLeft: '左视 Camera',
    cameraRight: '右视 Camera',
    cameraRear: '后视 Camera',
    obstacleSedan: '前方慢车',
    obstaclePedestrian: '右侧行人',
    obstacleCones: '施工锥桶',
    obstacleBarrier: '路障',
    obstacleCyclist: '左侧骑行者',
    obstacleShortVehicle: '车',
    obstacleShortPedestrian: '人',
    obstacleShortCone: '锥',
    obstacleShortBarrier: '障',
    obstacleShortCyclist: '骑',
    fov: '视场角',
    degreeUnit: '度',
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
