// 简单的部署测试脚本
// 使用方法: node test-deployment.js <your-worker-url>

const WebSocket = require('ws');

const WORKER_URL = process.argv[2] || 'ws://localhost:8787';
const TABLE_ID = 'test-table';

async function testDeployment() {
  console.log('🔥 开始测试火锅游戏部署...');
  
  try {
    // 测试 HTTP 接口
    console.log('\n📡 测试 HTTP 接口...');
    const httpUrl = WORKER_URL.replace('ws://', 'http://').replace('wss://', 'https://');
    
    const response = await fetch(`${httpUrl}/api/tables`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HTTP 接口正常:', data);
    } else {
      console.log('❌ HTTP 接口异常:', response.status);
    }
    
    // 测试 WebSocket 连接
    console.log('\n🔌 测试 WebSocket 连接...');
    const wsUrl = `${WORKER_URL}/table/${TABLE_ID}`;
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ WebSocket 连接成功');
      
      // 模拟玩家加入
      ws.send(JSON.stringify({
        type: 'join',
        payload: {
          playerId: 'test-player-1',
          playerName: '测试玩家'
        }
      }));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        console.log('📨 收到消息:', message.type);
        
        if (message.type === 'gameState') {
          console.log('✅ 游戏状态同步正常');
          
          // 测试添加菜品
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: 'addDish',
              payload: {
                id: 'test-dish',
                name: '测试菜品',
                category: '测试',
                price: 10,
                emoji: '🥬',
                cookingTime: 5000,
                potType: 'mild'
              }
            }));
          }, 1000);
        }
        
        if (message.type === 'dishesData') {
          console.log('✅ 菜品数据加载正常，共', message.payload.length, '种菜品');
        }
      } catch (error) {
        console.log('❌ 消息解析失败:', error.message);
      }
    });
    
    ws.on('error', (error) => {
      console.log('❌ WebSocket 错误:', error.message);
    });
    
    ws.on('close', () => {
      console.log('🔌 WebSocket 连接关闭');
    });
    
    // 5秒后关闭连接
    setTimeout(() => {
      ws.close();
      console.log('\n🎉 测试完成！');
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.log('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testDeployment();
}

module.exports = { testDeployment };