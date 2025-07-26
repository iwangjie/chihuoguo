export class HotPotTable {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = [];
    this.gameState = {
      seats: Array(7).fill(null).map(() => ({ player: null })),
      dishes: [],
      messages: []
    };
    
    // 从持久化存储加载游戏状态
    this.initializeState();
  }

  async initializeState() {
    try {
      const savedState = await this.state.storage.get('gameState');
      if (savedState) {
        this.gameState = { ...this.gameState, ...savedState };
      }
    } catch (error) {
      console.error('加载游戏状态失败:', error);
    }
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    // 处理 WebSocket 升级请求
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    
    // 处理 HTTP 请求 - 返回当前游戏状态
    if (url.pathname.endsWith('/status')) {
      return new Response(JSON.stringify({
        players: this.gameState.seats.filter(seat => seat.player).length,
        dishes: this.gameState.dishes.length,
        lastActivity: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }

  async handleWebSocket(request) {
    const [client, server] = Object.values(new WebSocketPair());
    
    server.accept();
    
    const session = {
      webSocket: server,
      playerId: null,
      playerName: null,
      seatIndex: -1
    };
    
    this.sessions.push(session);
    
    server.addEventListener('message', (event) => {
      this.handleWebSocketMessage(session, event.data);
    });
    
    server.addEventListener('close', () => {
      this.handleWebSocketClose(session);
    });
    
    // 发送初始数据
    this.sendToSession(session, 'dishesData', this.getDishesData());
    
    return new Response(null, { status: 101, webSocket: client });
  }

  async handleWebSocketMessage(session, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join':
          await this.handlePlayerJoin(session, data.payload);
          break;
        case 'addDish':
          await this.handleAddDish(session, data.payload);
          break;
        case 'removeDish':
          await this.handleRemoveDish(session, data.payload);
          break;
        case 'sendMessage':
          await this.handleSendMessage(session, data.payload);
          break;
        default:
          console.log('未知消息类型:', data.type);
      }
    } catch (error) {
      console.error('处理 WebSocket 消息失败:', error);
    }
  }

  async handlePlayerJoin(session, payload) {
    const { playerId, playerName } = payload;
    
    // 查找空座位
    let seatIndex = this.gameState.seats.findIndex(seat => !seat.player);
    
    if (seatIndex === -1) {
      this.sendToSession(session, 'error', { message: '桌子已满' });
      return;
    }
    
    // 更新会话信息
    session.playerId = playerId;
    session.playerName = playerName;
    session.seatIndex = seatIndex;
    
    // 更新游戏状态
    this.gameState.seats[seatIndex] = {
      player: {
        id: playerId,
        name: playerName,
        joinedAt: Date.now()
      }
    };
    
    await this.saveGameState();
    this.broadcastGameState();
    
    // 广播玩家加入消息
    this.broadcast('playerJoined', {
      playerId,
      playerName,
      seatIndex
    });
  }

  async handleAddDish(session, dish) {
    if (!session.playerId) return;
    
    const newDish = {
      id: 'dish_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      ...dish,
      addedBy: session.playerId,
      addedAt: Date.now(),
      potType: dish.potType || 'mild' // 默认清汤
    };
    
    this.gameState.dishes.push(newDish);
    
    await this.saveGameState();
    this.broadcastGameState();
    
    // 启动烹饪计时器
    this.startCookingTimer(newDish);
  }

  async handleRemoveDish(session, payload) {
    if (!session.playerId) return;
    
    const { dishId } = payload;
    const dishIndex = this.gameState.dishes.findIndex(d => d.id === dishId);
    
    if (dishIndex !== -1) {
      const dish = this.gameState.dishes[dishIndex];
      
      // 检查是否可以捞起（烹饪时间足够）
      const cookingTime = Date.now() - dish.addedAt;
      const requiredTime = dish.cookingTime || 30000; // 默认30秒
      
      if (cookingTime >= requiredTime) {
        this.gameState.dishes.splice(dishIndex, 1);
        await this.saveGameState();
        this.broadcastGameState();
        
        this.broadcast('dishRemoved', {
          dishId,
          removedBy: session.playerId,
          dish: dish.name
        });
      } else {
        this.sendToSession(session, 'error', {
          message: '菜还没熟，再等等吧！'
        });
      }
    }
  }

  async handleSendMessage(session, payload) {
    if (!session.playerId) return;
    
    const { message } = payload;
    const seatIndex = session.seatIndex;
    
    if (seatIndex >= 0 && this.gameState.seats[seatIndex].player) {
      // 更新座位上的消息
      this.gameState.seats[seatIndex].player.message = message;
      this.gameState.seats[seatIndex].player.messageTime = Date.now();
      
      this.broadcastGameState();
      
      // 3秒后清除消息
      setTimeout(() => {
        if (this.gameState.seats[seatIndex].player) {
          this.gameState.seats[seatIndex].player.message = null;
          this.broadcastGameState();
        }
      }, 3000);
    }
  }

  handleWebSocketClose(session) {
    // 从会话列表中移除
    const sessionIndex = this.sessions.indexOf(session);
    if (sessionIndex !== -1) {
      this.sessions.splice(sessionIndex, 1);
    }
    
    // 如果玩家已加入游戏，清空座位
    if (session.seatIndex >= 0) {
      this.gameState.seats[session.seatIndex] = { player: null };
      this.saveGameState();
      this.broadcastGameState();
      
      this.broadcast('playerLeft', {
        playerId: session.playerId,
        playerName: session.playerName,
        seatIndex: session.seatIndex
      });
    }
  }

  startCookingTimer(dish) {
    const cookingTime = dish.cookingTime || 30000;
    
    setTimeout(() => {
      // 检查菜品是否还在锅里
      const currentDish = this.gameState.dishes.find(d => d.id === dish.id);
      if (currentDish) {
        this.broadcast('dishCooked', {
          dishId: dish.id,
          dishName: dish.name
        });
      }
    }, cookingTime);
  }

  sendToSession(session, type, payload) {
    if (session.webSocket.readyState === WebSocket.READY_STATE_OPEN) {
      session.webSocket.send(JSON.stringify({ type, payload }));
    }
  }

  broadcast(type, payload) {
    const message = JSON.stringify({ type, payload });
    this.sessions.forEach(session => {
      if (session.webSocket.readyState === WebSocket.READY_STATE_OPEN) {
        session.webSocket.send(message);
      }
    });
  }

  broadcastGameState() {
    this.broadcast('gameState', this.gameState);
  }

  async saveGameState() {
    try {
      await this.state.storage.put('gameState', this.gameState);
    } catch (error) {
      console.error('保存游戏状态失败:', error);
    }
  }

  getDishesData() {
    // 从数据文件导入菜品数据
    return [
      // 镇店之宝
      {
        id: 'signature_1',
        name: '毛肚',
        category: '镇店之宝',
        price: 28,
        emoji: '🥩',
        cookingTime: 15000,
        description: '新鲜毛肚，七上八下',
        spiciness: 2
      },
      {
        id: 'signature_2',
        name: '鸭肠',
        category: '镇店之宝',
        price: 25,
        emoji: '🦆',
        cookingTime: 10000,
        description: '脆嫩鸭肠，一涮即熟',
        spiciness: 1
      },
      {
        id: 'signature_3',
        name: '黄喉',
        category: '镇店之宝',
        price: 32,
        emoji: '🫀',
        cookingTime: 20000,
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
        cookingTime: 180000,
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
        cookingTime: 120000,
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
  }

  getQuickMessages() {
    return [
      // 基础表达
      '好吃！', '太辣了！', '不够辣！', '再来一盘', '我吃饱了', '慢点吃', '干杯！',
      
      // 火锅专用
      '这个熟了', '还没熟呢', '别抢我的菜', '帮我夹一下', '蘸料不够了', '加点汤', '火太大了',
      
      // 社交互动
      '哈哈哈', '666', '牛逼！', '真香！', '我先走了', '等等我', '一起吃',
      
      // 重庆话特色
      '巴适得很！', '安逸！', '莫得问题', '雄起！', '撒子嘛', '要得', '巴心巴肝',
      
      // 火锅文化
      '麻辣鲜香', '越吃越想吃', '停不下来', '爽歪歪', '过瘾！', '正宗！', '地道！'
    ];
  }
}