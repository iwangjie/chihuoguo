import { HotPotTable } from './HotPotTable.js';

export { HotPotTable };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 处理静态文件请求
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getIndexHTML(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    // 处理 WebSocket 连接请求
    if (url.pathname.startsWith('/table/')) {
      const tableId = url.pathname.split('/')[2];
      
      if (!tableId) {
        return new Response('Table ID required', { status: 400 });
      }
      
      // 获取或创建 Durable Object 实例
      const id = env.HOTPOT_TABLE.idFromName(tableId);
      const stub = env.HOTPOT_TABLE.get(id);
      
      // 转发请求到 Durable Object
      return stub.fetch(request);
    }
    
    // 处理 API 请求
    if (url.pathname === '/api/tables') {
      return new Response(JSON.stringify({
        message: 'Available tables',
        tables: ['table1', 'table2', 'table3']
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }
};

function getIndexHTML() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔥 模拟涮火锅 🔥</title>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        ${getStyles()}
    </style>
</head>
<body>
    <div id="app">
        <hot-pot-game></hot-pot-game>
    </div>
    <script type="module">
        ${getVueComponents()}
    </script>
</body>
</html>`;
}

function getStyles() {
  return `
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  background: linear-gradient(135deg, #2c1810 0%, #1a0f08 100%);
  color: #fff;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
}

/* 游戏容器 */
.game-container {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 加入游戏界面 */
.join-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: radial-gradient(circle at center, #3d2317 0%, #2c1810 70%);
}

.join-screen h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { text-shadow: 2px 2px 4px rgba(255,100,0,0.5); }
  to { text-shadow: 2px 2px 20px rgba(255,100,0,0.8); }
}

.join-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.join-form input {
  padding: 12px 20px;
  font-size: 1.1rem;
  border: 2px solid #d4691a;
  border-radius: 8px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  width: 300px;
  text-align: center;
}

.join-form input::placeholder {
  color: rgba(255,255,255,0.6);
}

.join-form button {
  padding: 12px 30px;
  font-size: 1.2rem;
  background: linear-gradient(45deg, #d4691a, #ff8c42);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.join-form button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212,105,26,0.4);
}

.join-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 游戏主界面 */
.game-main {
  width: 100%;
  height: 100%;
  position: relative;
}

/* 火锅桌 */
.hotpot-table {
  width: 100%;
  height: 100%;
  position: relative;
  background: 
    radial-gradient(circle at 30% 70%, rgba(139,69,19,0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(160,82,45,0.2) 0%, transparent 50%),
    linear-gradient(135deg, #2c1810 0%, #1a0f08 100%);
}

.table-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  height: 600px;
}

/* 火锅 */
.hotpot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 200px;
  border-radius: 50%;
  border: 8px solid #8B4513;
  cursor: pointer;
  display: flex;
  transition: all 0.3s ease;
  box-shadow: 
    inset 0 0 20px rgba(0,0,0,0.5),
    0 0 30px rgba(212,105,26,0.3);
}

.hotpot:hover {
  transform: translate(-50%, -50%) scale(1.05);
  box-shadow: 
    inset 0 0 20px rgba(0,0,0,0.5),
    0 0 40px rgba(212,105,26,0.5);
}

.pot-left, .pot-right {
  flex: 1;
  position: relative;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  padding: 10px;
}

.pot-left.spicy {
  background: radial-gradient(circle, #ff4444 0%, #cc0000 100%);
  animation: bubble 2s infinite;
}

.pot-right.mild {
  background: radial-gradient(circle, #f0f0f0 0%, #cccccc 100%);
  animation: bubble 2.5s infinite;
}

@keyframes bubble {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* 锅中的菜品 */
.dish-in-pot {
  background: rgba(255,255,255,0.9);
  color: #333;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(0,0,0,0.2);
  animation: float 3s ease-in-out infinite;
}

.dish-in-pot:hover {
  transform: scale(1.1);
  background: rgba(255,255,255,1);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

/* 座位 */
.seat {
  position: absolute;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid #8B4513;
  background: rgba(139,69,19,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.seat.occupied {
  background: rgba(212,105,26,0.6);
  border-color: #d4691a;
}

.seat-0 { top: 0; left: 50%; transform: translateX(-50%); }
.seat-1 { top: 15%; right: 10%; }
.seat-2 { top: 50%; right: 0; transform: translateY(-50%); }
.seat-3 { bottom: 15%; right: 10%; }
.seat-4 { bottom: 0; left: 50%; transform: translateX(-50%); }
.seat-5 { bottom: 15%; left: 10%; }
.seat-6 { top: 50%; left: 0; transform: translateY(-50%); }

.player-info {
  text-align: center;
  position: relative;
}

.player-name {
  font-size: 0.8rem;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
}

.chat-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.95);
  color: #333;
  padding: 8px 12px;
  border-radius: 15px;
  font-size: 0.7rem;
  white-space: nowrap;
  margin-bottom: 10px;
  animation: fadeInOut 3s ease-in-out;
}

.chat-bubble::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(255,255,255,0.95);
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(10px); }
  10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-10px); }
}

.empty-seat {
  font-size: 0.7rem;
  color: rgba(255,255,255,0.6);
  text-align: center;
}

/* 快捷喊话 */
.quick-chat {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 80%;
}

.chat-btn {
  padding: 8px 16px;
  background: rgba(212,105,26,0.8);
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.chat-btn:hover {
  background: rgba(212,105,26,1);
  transform: translateY(-2px);
}

/* 菜单样式 */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.menu-container {
  background: linear-gradient(135deg, #3d2317 0%, #2c1810 100%);
  border-radius: 15px;
  padding: 20px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  border: 2px solid #d4691a;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: scale(0.8); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #d4691a;
  padding-bottom: 10px;
}

.menu-header h2 {
  color: #d4691a;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: #d4691a;
  font-size: 2rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ff8c42;
}

.menu-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.category h3 {
  color: #ff8c42;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.dish-item {
  background: rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 15px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(212,105,26,0.3);
}

.dish-item:hover {
  background: rgba(212,105,26,0.3);
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(212,105,26,0.2);
}

.dish-image {
  font-size: 2rem;
  margin-bottom: 8px;
}

.dish-name {
  font-weight: bold;
  margin-bottom: 5px;
  font-size: 0.9rem;
}

.dish-price {
  color: #ff8c42;
  font-weight: bold;
  font-size: 0.8rem;
}

.dish-cooking-time {
  color: #ccc;
  font-size: 0.7rem;
  margin-top: 2px;
}

/* 锅底选择器 */
.pot-selector {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(212,105,26,0.3);
}

.pot-selector h3 {
  color: #ff8c42;
  margin-bottom: 10px;
  font-size: 1rem;
}

.pot-options {
  display: flex;
  gap: 10px;
}

.pot-btn {
  padding: 8px 16px;
  border: 2px solid rgba(212,105,26,0.5);
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.pot-btn:hover {
  background: rgba(212,105,26,0.3);
  border-color: #d4691a;
}

.pot-btn.active {
  background: #d4691a;
  border-color: #ff8c42;
  color: #fff;
}

/* 连接状态 */
.connection-status {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255,0,0,0.8);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 0.9rem;
  z-index: 1001;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .table-container {
    width: 90vw;
    height: 90vw;
    max-width: 500px;
    max-height: 500px;
  }
  
  .hotpot {
    width: 250px;
    height: 160px;
  }
  
  .seat {
    width: 60px;
    height: 60px;
  }
  
  .join-form input {
    width: 250px;
  }
  
  .menu-container {
    max-width: 95%;
    max-height: 90%;
  }
  
  .dishes-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .quick-chat {
    max-width: 95%;
  }
  
  .chat-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
}
  `;
}

function getVueComponents() {
  return `
// WebSocket 服务
class WebSocketService {
  constructor() {
    this.ws = null;
    this.callbacks = {};
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(tableId) {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = \`\${protocol}//\${location.host}/table/\${tableId}\`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket 连接已建立');
      this.reconnectAttempts = 0;
      this.emit('connected');
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit(data.type, data.payload);
      } catch (error) {
        console.error('解析消息失败:', error);
      }
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket 连接已关闭');
      this.emit('disconnected');
      this.attemptReconnect(tableId);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket 错误:', error);
      this.emit('error', error);
    };
  }

  attemptReconnect(tableId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(\`尝试重连 (\${this.reconnectAttempts}/\${this.maxReconnectAttempts})\`);
        this.connect(tableId);
      }, 2000 * this.reconnectAttempts);
    }
  }

  send(type, payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  emit(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 主游戏组件
const HotPotGame = {
  template: \`
    <div class="game-container">
      <div v-if="!joined" class="join-screen">
        <h1>🔥 模拟涮火锅 🔥</h1>
        <div class="join-form">
          <input v-model="playerName" placeholder="输入你的昵称" maxlength="10">
          <input v-model="tableId" placeholder="桌子ID (默认: table1)" maxlength="20">
          <button @click="joinTable" :disabled="!playerName.trim()">加入游戏</button>
        </div>
      </div>
      
      <div v-else class="game-main">
        <hot-pot-table 
          :game-state="gameState"
          :player-id="playerId"
          @add-dish="addDish"
          @remove-dish="removeDish"
          @send-message="sendMessage"
        ></hot-pot-table>
        
        <dish-menu 
          v-if="showMenu"
          :dishes="dishes"
          @select-dish="selectDish"
          @close="showMenu = false"
        ></dish-menu>
      </div>
      
      <div v-if="connectionStatus !== 'connected'" class="connection-status">
        {{ connectionStatus === 'connecting' ? '连接中...' : '连接已断开，尝试重连中...' }}
      </div>
    </div>
  \`,
  
  data() {
    return {
      joined: false,
      playerName: '',
      tableId: 'table1',
      playerId: null,
      gameState: null,
      showMenu: false,
      connectionStatus: 'disconnected',
      wsService: new WebSocketService(),
      dishes: [] // 将从服务器获取
    };
  },
  
  methods: {
    joinTable() {
      if (!this.playerName.trim()) return;
      
      this.connectionStatus = 'connecting';
      this.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      this.wsService.on('connected', () => {
        this.connectionStatus = 'connected';
        this.wsService.send('join', {
          playerId: this.playerId,
          playerName: this.playerName.trim()
        });
      });
      
      this.wsService.on('disconnected', () => {
        this.connectionStatus = 'disconnected';
      });
      
      this.wsService.on('gameState', (state) => {
        this.gameState = state;
        if (!this.joined) {
          this.joined = true;
        }
      });
      
      this.wsService.on('dishesData', (dishesData) => {
        this.dishes = dishesData;
      });
      
      this.wsService.connect(this.tableId || 'table1');
    },
    
    addDish(dish) {
      this.wsService.send('addDish', dish);
    },
    
    removeDish(dishId) {
      this.wsService.send('removeDish', { dishId });
    },
    
    sendMessage(message) {
      this.wsService.send('sendMessage', { message });
    },
    
    selectDish(dish) {
      this.addDish(dish);
      this.showMenu = false;
    }
  },
  
  beforeUnmount() {
    this.wsService.disconnect();
  }
};

// 火锅桌组件
const HotPotTable = {
  props: ['gameState', 'playerId'],
  emits: ['add-dish', 'remove-dish', 'send-message'],
  
  template: \`
    <div class="hotpot-table">
      <div class="table-container">
        <!-- 火锅 -->
        <div class="hotpot" @click="showDishMenu">
          <div class="pot-left spicy">
            <div v-for="dish in spicyDishes" :key="dish.id" 
                 class="dish-in-pot" 
                 :style="getDishStyle(dish)"
                 @click.stop="removeDish(dish.id)">
              {{ dish.name }}
            </div>
          </div>
          <div class="pot-right mild">
            <div v-for="dish in mildDishes" :key="dish.id" 
                 class="dish-in-pot"
                 :style="getDishStyle(dish)"
                 @click.stop="removeDish(dish.id)">
              {{ dish.name }}
            </div>
          </div>
        </div>
        
        <!-- 座位 -->
        <div v-for="(seat, index) in seats" :key="index" 
             :class="['seat', \`seat-\${index}\`, { occupied: seat.player }]">
          <div v-if="seat.player" class="player-info">
            <div class="player-name">{{ seat.player.name }}</div>
            <div v-if="seat.player.message" class="chat-bubble">
              {{ seat.player.message }}
            </div>
          </div>
          <div v-else class="empty-seat">空座位</div>
        </div>
      </div>
      
      <!-- 快捷喊话 -->
      <div class="quick-chat">
        <button v-for="msg in quickMessages" :key="msg" 
                @click="sendQuickMessage(msg)" class="chat-btn">
          {{ msg }}
        </button>
      </div>
    </div>
  \`,
  
  computed: {
    seats() {
      return this.gameState?.seats || Array(7).fill(null).map(() => ({ player: null }));
    },
    
    spicyDishes() {
      return this.gameState?.dishes?.filter(d => d.potType === 'spicy') || [];
    },
    
    mildDishes() {
      return this.gameState?.dishes?.filter(d => d.potType === 'mild') || [];
    }
  },
  
  data() {
    return {
      quickMessages: [
        '好吃！', '太辣了！', '不够辣！', '再来一盘', '我吃饱了', '慢点吃', '干杯！',
        '这个熟了', '还没熟呢', '别抢我的菜', '帮我夹一下', '巴适得很！', '安逸！', '雄起！'
      ]
    };
  },
  
  methods: {
    showDishMenu() {
      this.$parent.showMenu = true;
    },
    
    removeDish(dishId) {
      this.$emit('remove-dish', dishId);
    },
    
    sendQuickMessage(message) {
      this.$emit('send-message', message);
    },
    
    getDishStyle(dish) {
      const cookingProgress = this.getCookingProgress(dish);
      const opacity = 0.7 + (cookingProgress * 0.3);
      return {
        opacity,
        transform: \`scale(\${0.8 + cookingProgress * 0.2})\`
      };
    },
    
    getCookingProgress(dish) {
      if (!dish.addedAt) return 0;
      const elapsed = Date.now() - dish.addedAt;
      const cookingTime = dish.cookingTime || 30000; // 默认30秒
      return Math.min(elapsed / cookingTime, 1);
    }
  }
};

// 菜单组件
const DishMenu = {
  props: ['dishes'],
  emits: ['select-dish', 'close'],
  
  data() {
    return {
      selectedPot: 'mild' // 默认选择清汤锅
    };
  },
  
  template: \`
    <div class="menu-overlay" @click="$emit('close')">
      <div class="menu-container" @click.stop>
        <div class="menu-header">
          <h2>菜单</h2>
          <button @click="$emit('close')" class="close-btn">×</button>
        </div>
        
        <div class="pot-selector">
          <h3>选择锅底：</h3>
          <div class="pot-options">
            <button :class="['pot-btn', { active: selectedPot === 'spicy' }]" 
                    @click="selectedPot = 'spicy'">
              🌶️ 麻辣锅
            </button>
            <button :class="['pot-btn', { active: selectedPot === 'mild' }]" 
                    @click="selectedPot = 'mild'">
              🥛 清汤锅
            </button>
          </div>
        </div>

        <div class="menu-categories">
          <div v-for="category in categories" :key="category.name" class="category">
            <h3>{{ category.name }}</h3>
            <div class="dishes-grid">
              <div v-for="dish in category.dishes" :key="dish.id" 
                   class="dish-item" @click="selectDish(dish)">
                <div class="dish-image">{{ dish.emoji }}</div>
                <div class="dish-name">{{ dish.name }}</div>
                <div class="dish-price">¥{{ dish.price }}</div>
                <div class="dish-cooking-time">{{ Math.round(dish.cookingTime / 1000) }}秒</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  \`,
  
  computed: {
    categories() {
      const categoryMap = {};
      this.dishes.forEach(dish => {
        if (!categoryMap[dish.category]) {
          categoryMap[dish.category] = {
            name: dish.category,
            dishes: []
          };
        }
        categoryMap[dish.category].dishes.push(dish);
      });
      return Object.values(categoryMap);
    }
  },
  
  methods: {
    selectDish(dish) {
      const dishWithPot = {
        ...dish,
        potType: this.selectedPot
      };
      this.$emit('select-dish', dishWithPot);
    }
  }
};

// 注册组件并创建应用
const { createApp } = Vue;

createApp({
  components: {
    HotPotGame,
    HotPotTable,
    DishMenu
  }
}).mount('#app');
`;
}