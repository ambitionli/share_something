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
    statusReplay: string;
    statusPaused: string;
    sceneTitle: string;
    playbackTitle: string;
    obstacleTitle: string;
    cameraTitle: string;
    play: string;
    pause: string;
    cameraOk: string;
    cameraFeeds: {
      front: { name: string; position: string };
      left: { name: string; position: string };
      right: { name: string; position: string };
      rear: { name: string; position: string };
    };
    cameraLabels: {
      frontRoad: string;
      leftCurb: string;
      rightCurb: string;
      rearRoad: string;
    };
    cameraDescriptions: {
      frontClear: string;
      frontPedestrian: string;
      leftCurb: string;
      rightStation: string;
      rightPedestrian: string;
      rearRoad: string;
    };
    alerts: {
      pedestrianCrosswalk: string;
      vruCandidate: string;
    };
    buildings: {
      officeA: string;
      mall: string;
      hotel: string;
      parkTower: string;
      station: string;
      depot: string;
    };
    obstacles: {
      labels: {
        truck: string;
        pedestrian: string;
        cone: string;
        barrier: string;
        sedan: string;
      };
      types: {
        vehicle: string;
        pedestrian: string;
        barrier: string;
        cone: string;
      };
      risks: {
        low: string;
        medium: string;
        high: string;
      };
    };
    stats: {
      frames: string;
      lidarPoints: string;
      cameras: string;
      speed: string;
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
    menu: '自动驾驶 WebViz',
    title: '自动驾驶数据回放',
    subtitle: '同步回放自车轨迹、激光雷达点云、障碍物和四路相机感知画面',
    statusReplay: '回放中',
    statusPaused: '已暂停',
    sceneTitle: '道路与点云俯视图',
    playbackTitle: '时间轴控制',
    obstacleTitle: '障碍物列表',
    cameraTitle: '周视相机画面',
    play: '播放',
    pause: '暂停',
    cameraOk: '正常',
    cameraFeeds: {
      front: { name: '前视', position: '前视 120°' },
      left: { name: '左视', position: '左侧广角' },
      right: { name: '右视', position: '右侧广角' },
      rear: { name: '后视', position: '后视' },
    },
    cameraLabels: {
      frontRoad: '前方道路',
      leftCurb: '左侧路缘',
      rightCurb: '右侧路缘',
      rearRoad: '后方道路',
    },
    cameraDescriptions: {
      frontClear: '车道清晰，前方有卡车',
      frontPedestrian: '前方卡车与右侧路缘行人进入视野',
      leftCurb: '建筑立面、停车带与低速施工锥',
      rightStation: '站点入口与人行道',
      rightPedestrian: '行人与站点入口可见',
      rearRoad: '后车保持在安全包络外',
    },
    alerts: {
      pedestrianCrosswalk: '行人进入横穿区域',
      vruCandidate: '弱势交通参与者候选',
    },
    buildings: {
      officeA: '办公楼 A',
      mall: '商场',
      hotel: '酒店',
      parkTower: '公园塔楼',
      station: '站点',
      depot: '车库',
    },
    obstacles: {
      labels: {
        truck: '卡车',
        pedestrian: '行人',
        cone: '锥桶',
        barrier: '路障',
        sedan: '轿车',
      },
      types: {
        vehicle: '车辆',
        pedestrian: '行人',
        barrier: '路障',
        cone: '锥桶',
      },
      risks: {
        low: '低风险',
        medium: '中风险',
        high: '高风险',
      },
    },
    stats: {
      frames: '回放帧',
      lidarPoints: '当前点云',
      cameras: '相机路数',
      speed: '自车速度',
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
