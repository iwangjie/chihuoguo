// 菜品数据
export const dishesData = [
  // 镇店之宝
  {
    id: 'signature_1',
    name: '毛肚',
    category: '镇店之宝',
    price: 28,
    emoji: '🥩',
    cookingTime: 15000, // 15秒
    description: '新鲜毛肚，七上八下',
    spiciness: 2
  },
  {
    id: 'signature_2',
    name: '鸭肠',
    category: '镇店之宝',
    price: 25,
    emoji: '🦆',
    cookingTime: 10000, // 10秒
    description: '脆嫩鸭肠，一涮即熟',
    spiciness: 1
  },
  {
    id: 'signature_3',
    name: '黄喉',
    category: '镇店之宝',
    price: 32,
    emoji: '🫀',
    cookingTime: 20000, // 20秒
    description: '爽脆黄喉，口感独特',
    spiciness: 2
  },
  {
    id: 'signature_4',
    name: '嫩牛肉',
    category: '镇店之宝',
    price: 45,
    emoji: '🥩',
    cookingTime: 12000,
    description: '精选嫩牛肉，入口即化',
    spiciness: 3
  },

  // 荤菜
  {
    id: 'meat_1',
    name: '肥牛卷',
    category: '荤菜',
    price: 35,
    emoji: '🥩',
    cookingTime: 25000,
    description: '优质肥牛，肉质鲜美',
    spiciness: 2
  },
  {
    id: 'meat_2',
    name: '羊肉卷',
    category: '荤菜',
    price: 38,
    emoji: '🐑',
    cookingTime: 30000,
    description: '新鲜羊肉，无膻味',
    spiciness: 3
  },
  {
    id: 'meat_3',
    name: '午餐肉',
    category: '荤菜',
    price: 18,
    emoji: '🥓',
    cookingTime: 15000,
    description: '经典午餐肉',
    spiciness: 1
  },
  {
    id: 'meat_4',
    name: '虾滑',
    category: '荤菜',
    price: 28,
    emoji: '🦐',
    cookingTime: 20000,
    description: '手打虾滑，Q弹爽口',
    spiciness: 1
  },
  {
    id: 'meat_5',
    name: '鱼豆腐',
    category: '荤菜',
    price: 15,
    emoji: '🐟',
    cookingTime: 18000,
    description: '鲜美鱼豆腐',
    spiciness: 1
  },
  {
    id: 'meat_6',
    name: '腊肠',
    category: '荤菜',
    price: 22,
    emoji: '🌭',
    cookingTime: 25000,
    description: '四川腊肠，香味浓郁',
    spiciness: 2
  },
  {
    id: 'meat_7',
    name: '鸭血',
    category: '荤菜',
    price: 12,
    emoji: '🩸',
    cookingTime: 30000,
    description: '嫩滑鸭血',
    spiciness: 2
  },

  // 素菜
  {
    id: 'veg_1',
    name: '土豆片',
    category: '素菜',
    price: 8,
    emoji: '🥔',
    cookingTime: 35000,
    description: '新鲜土豆片',
    spiciness: 0
  },
  {
    id: 'veg_2',
    name: '莲藕片',
    category: '素菜',
    price: 12,
    emoji: '🪷',
    cookingTime: 40000,
    description: '脆嫩莲藕',
    spiciness: 0
  },
  {
    id: 'veg_3',
    name: '冬瓜',
    category: '素菜',
    price: 10,
    emoji: '🥒',
    cookingTime: 30000,
    description: '清甜冬瓜',
    spiciness: 0
  },
  {
    id: 'veg_4',
    name: '白萝卜',
    category: '素菜',
    price: 8,
    emoji: '🥕',
    cookingTime: 35000,
    description: '爽脆白萝卜',
    spiciness: 0
  },
  {
    id: 'veg_5',
    name: '娃娃菜',
    category: '素菜',
    price: 12,
    emoji: '🥬',
    cookingTime: 25000,
    description: '嫩滑娃娃菜',
    spiciness: 0
  },
  {
    id: 'veg_6',
    name: '金针菇',
    category: '素菜',
    price: 15,
    emoji: '🍄',
    cookingTime: 20000,
    description: '鲜美金针菇',
    spiciness: 0
  },
  {
    id: 'veg_7',
    name: '豆皮',
    category: '素菜',
    price: 10,
    emoji: '🫘',
    cookingTime: 15000,
    description: '香滑豆皮',
    spiciness: 0
  },
  {
    id: 'veg_8',
    name: '海带',
    category: '素菜',
    price: 8,
    emoji: '🌿',
    cookingTime: 25000,
    description: '爽脆海带',
    spiciness: 0
  },
  {
    id: 'veg_9',
    name: '木耳',
    category: '素菜',
    price: 14,
    emoji: '🍄',
    cookingTime: 20000,
    description: '脆嫩木耳',
    spiciness: 0
  },

  // 丸子类
  {
    id: 'ball_1',
    name: '牛肉丸',
    category: '丸子类',
    price: 22,
    emoji: '⚽',
    cookingTime: 45000,
    description: '手工牛肉丸',
    spiciness: 1
  },
  {
    id: 'ball_2',
    name: '鱼丸',
    category: '丸子类',
    price: 18,
    emoji: '🏐',
    cookingTime: 40000,
    description: 'Q弹鱼丸',
    spiciness: 1
  },
  {
    id: 'ball_3',
    name: '墨鱼丸',
    category: '丸子类',
    price: 25,
    emoji: '🖤',
    cookingTime: 42000,
    description: '鲜美墨鱼丸',
    spiciness: 1
  },
  {
    id: 'ball_4',
    name: '虾丸',
    category: '丸子类',
    price: 26,
    emoji: '🦐',
    cookingTime: 38000,
    description: '鲜甜虾丸',
    spiciness: 1
  },
  {
    id: 'ball_5',
    name: '蟹柳',
    category: '丸子类',
    price: 20,
    emoji: '🦀',
    cookingTime: 35000,
    description: '鲜美蟹柳',
    spiciness: 1
  },

  // 主食
  {
    id: 'staple_1',
    name: '宽粉',
    category: '主食',
    price: 8,
    emoji: '🍜',
    cookingTime: 60000,
    description: '爽滑宽粉',
    spiciness: 0
  },
  {
    id: 'staple_2',
    name: '方便面',
    category: '主食',
    price: 6,
    emoji: '🍝',
    cookingTime: 180000, // 3分钟
    description: '经典方便面',
    spiciness: 0
  },
  {
    id: 'staple_3',
    name: '年糕',
    category: '主食',
    price: 12,
    emoji: '🍘',
    cookingTime: 50000,
    description: '软糯年糕',
    spiciness: 0
  },
  {
    id: 'staple_4',
    name: '米线',
    category: '主食',
    price: 10,
    emoji: '🍜',
    cookingTime: 45000,
    description: '云南米线',
    spiciness: 0
  },
  {
    id: 'staple_5',
    name: '乌冬面',
    category: '主食',
    price: 14,
    emoji: '🍜',
    cookingTime: 120000, // 2分钟
    description: '日式乌冬面',
    spiciness: 0
  },

  // 豆制品
  {
    id: 'tofu_1',
    name: '嫩豆腐',
    category: '豆制品',
    price: 8,
    emoji: '🧈',
    cookingTime: 30000,
    description: '嫩滑豆腐',
    spiciness: 0
  },
  {
    id: 'tofu_2',
    name: '冻豆腐',
    category: '豆制品',
    price: 10,
    emoji: '🧊',
    cookingTime: 25000,
    description: '多孔冻豆腐，易入味',
    spiciness: 0
  },
  {
    id: 'tofu_3',
    name: '千张',
    category: '豆制品',
    price: 12,
    emoji: '📄',
    cookingTime: 20000,
    description: '薄如纸的千张',
    spiciness: 0
  },
  {
    id: 'tofu_4',
    name: '腐竹',
    category: '豆制品',
    price: 15,
    emoji: '🥢',
    cookingTime: 35000,
    description: '香滑腐竹',
    spiciness: 0
  }
];

// 快捷喊话数据
export const quickMessagesData = [
  // 基础表达
  '好吃！',
  '太辣了！',
  '不够辣！',
  '再来一盘',
  '我吃饱了',
  '慢点吃',
  '干杯！',
  
  // 火锅专用
  '这个熟了',
  '还没熟呢',
  '别抢我的菜',
  '帮我夹一下',
  '蘸料不够了',
  '加点汤',
  '火太大了',
  
  // 社交互动
  '哈哈哈',
  '666',
  '牛逼！',
  '真香！',
  '我先走了',
  '等等我',
  '一起吃',
  
  // 重庆话特色
  '巴适得很！',
  '安逸！',
  '莫得问题',
  '雄起！',
  '撒子嘛',
  '要得',
  '巴心巴肝',
  
  // 火锅文化
  '麻辣鲜香',
  '越吃越想吃',
  '停不下来',
  '爽歪歪',
  '过瘾！',
  '正宗！',
  '地道！'
];

// 游戏配置
export const gameConfig = {
  maxPlayers: 7,
  defaultCookingTime: 30000, // 30秒
  messageDuration: 3000, // 消息显示3秒
  reconnectAttempts: 5,
  reconnectDelay: 2000,
  
  // 锅的类型
  potTypes: {
    spicy: {
      name: '麻辣锅',
      color: '#ff4444',
      spiciness: 3
    },
    mild: {
      name: '清汤锅',
      color: '#f0f0f0',
      spiciness: 0
    }
  },
  
  // 座位配置
  seatPositions: [
    { top: '0', left: '50%', transform: 'translateX(-50%)' },
    { top: '15%', right: '10%' },
    { top: '50%', right: '0', transform: 'translateY(-50%)' },
    { bottom: '15%', right: '10%' },
    { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
    { bottom: '15%', left: '10%' },
    { top: '50%', left: '0', transform: 'translateY(-50%)' }
  ]
};