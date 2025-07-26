# 🏗️ 项目架构详解

## 概述

本项目是一个基于 Cloudflare Workers + Durable Objects 的网页版多人火锅游戏，采用现代化的无服务器架构，实现了高性能、高可用的实时多人在线体验。

## 核心架构设计

### 1. 边缘计算架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Edge Network                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Worker    │    │   Worker    │    │   Worker    │     │
│  │  (Region A) │    │  (Region B) │    │  (Region C) │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Durable Objects                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Table 1   │    │   Table 2   │    │   Table 3   │     │
│  │ HotPotTable │    │ HotPotTable │    │ HotPotTable │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2. 数据流架构

```
客户端 (Vue.js)
    │
    │ HTTP Request
    ▼
Cloudflare Worker
    │
    │ Route by tableId
    ▼
Durable Object (HotPotTable)
    │
    │ WebSocket Upgrade
    ▼
WebSocket Connection Pool
    │
    │ Game Events
    ▼
Game State Management
    │
    │ Persistence
    ▼
Durable Object Storage
```

## 技术选型理由

### Cloudflare Workers
- **全球分发**: 在 200+ 个边缘节点运行，延迟 < 10ms
- **无服务器**: 无需管理服务器，自动扩缩容
- **成本效益**: 按请求付费，无空闲成本

### Durable Objects
- **强一致性**: 每个火锅桌是独立的有状态对象
- **自动迁移**: 根据用户位置自动迁移到最近节点
- **持久化存储**: 内置事务性键值存储

### Vue.js 3
- **轻量级**: 适合嵌入到 Worker 响应中
- **响应式**: 完美处理实时游戏状态更新
- **组件化**: 清晰的代码结构

## 核心组件详解

### 1. Worker 入口 (worker.js)

```javascript
// 主要职责：
// 1. 路由请求到对应的 Durable Object
// 2. 提供静态文件服务
// 3. 处理 API 请求

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/table/')) {
      const tableId = url.pathname.split('/')[2];
      const id = env.HOTPOT_TABLE.idFromName(tableId);
      const stub = env.HOTPOT_TABLE.get(id);
      return stub.fetch(request);
    }
    
    // ... 其他路由处理
  }
};
```

### 2. Durable Object (HotPotTable.js)

```javascript
// 主要职责：
// 1. 管理单个火锅桌的所有状态
// 2. 处理 WebSocket 连接
// 3. 实现游戏逻辑
// 4. 状态持久化

export class HotPotTable {
  constructor(state, env) {
    this.state = state;
    this.sessions = [];
    this.gameState = {
      seats: Array(7).fill(null).map(() => ({ player: null })),
      dishes: [],
      messages: []
    };
  }
  
  async fetch(request) {
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }
    // ... 其他处理
  }
}
```

### 3. 前端架构

```javascript
// 组件层次结构：
HotPotGame (根组件)
├── HotPotTable (游戏场景)
│   ├── 火锅组件
│   ├── 座位组件 × 7
│   └── 快捷喊话组件
└── DishMenu (菜单组件)
    ├── 锅底选择器
    └── 菜品分类展示
```

## 状态管理

### 游戏状态结构

```javascript
gameState = {
  seats: [
    {
      player: {
        id: 'player_123',
        name: '玩家昵称',
        joinedAt: 1640995200000,
        message: '当前消息',
        messageTime: 1640995300000
      }
    },
    // ... 其他座位
  ],
  dishes: [
    {
      id: 'dish_456',
      name: '毛肚',
      category: '镇店之宝',
      price: 28,
      emoji: '🥩',
      cookingTime: 15000,
      addedBy: 'player_123',
      addedAt: 1640995400000,
      potType: 'spicy'
    },
    // ... 其他菜品
  ],
  messages: [] // 历史消息（可选）
}
```

### 状态同步机制

1. **客户端操作** → WebSocket 消息
2. **Durable Object 处理** → 更新内部状态
3. **状态持久化** → Durable Object Storage
4. **广播更新** → 所有连接的客户端

## 实时通信

### WebSocket 消息格式

```javascript
// 客户端 → 服务器
{
  type: 'join|addDish|removeDish|sendMessage',
  payload: { /* 具体数据 */ }
}

// 服务器 → 客户端
{
  type: 'gameState|dishesData|playerJoined|playerLeft|dishCooked|error',
  payload: { /* 具体数据 */ }
}
```

### 连接管理

- **连接池**: Durable Object 维护所有 WebSocket 连接
- **自动重连**: 客户端实现指数退避重连
- **心跳检测**: 定期检查连接状态
- **优雅断开**: 玩家离开时清理状态

## 性能优化

### 1. 边缘计算优势
- **就近访问**: 用户连接到最近的边缘节点
- **冷启动优化**: Worker 启动时间 < 5ms
- **内存效率**: 每个 Worker 实例共享代码

### 2. Durable Object 优化
- **状态局部性**: 每个桌子独立，避免全局锁
- **自动迁移**: 根据用户分布自动迁移
- **存储优化**: 只持久化必要状态

### 3. 前端优化
- **组件懒加载**: 菜单组件按需加载
- **状态缓存**: 避免重复渲染
- **动画优化**: 使用 CSS 动画减少 JS 计算

## 扩展性设计

### 水平扩展
- **无状态 Worker**: 可以无限扩展
- **独立桌子**: 每个桌子是独立的 Durable Object
- **自动负载均衡**: Cloudflare 自动分发请求

### 功能扩展
- **新菜品**: 在 `data.js` 中添加
- **新游戏模式**: 扩展 Durable Object 逻辑
- **新交互**: 添加新的 WebSocket 消息类型

## 安全考虑

### 1. 输入验证
- 所有用户输入都在服务器端验证
- 防止 XSS 和注入攻击
- 限制消息长度和频率

### 2. 访问控制
- 基于 tableId 的隔离
- 玩家只能操作自己的状态
- 防止跨桌子数据泄露

### 3. DDoS 防护
- Cloudflare 内置 DDoS 防护
- 请求频率限制
- 异常连接检测

## 监控和调试

### 1. 日志记录
```javascript
console.log('玩家加入:', { playerId, playerName, tableId });
console.error('WebSocket 错误:', error);
```

### 2. 性能监控
- Worker 执行时间
- WebSocket 连接数
- 状态更新频率

### 3. 调试工具
```bash
wrangler tail          # 实时日志
wrangler dev           # 本地开发
wrangler deploy --dry-run  # 部署预检
```

## 部署策略

### 1. 环境管理
- **开发环境**: `wrangler dev`
- **测试环境**: `wrangler deploy --env staging`
- **生产环境**: `wrangler deploy --env production`

### 2. 版本控制
- 使用 Git 标签管理版本
- 渐进式部署策略
- 回滚机制

### 3. 配置管理
```toml
# wrangler.toml
[env.production]
name = "hotpot-game-prod"
vars = { ENVIRONMENT = "production" }

[env.staging]
name = "hotpot-game-staging"
vars = { ENVIRONMENT = "staging" }
```

## 成本分析

### Cloudflare Workers 定价
- **免费额度**: 100,000 请求/天
- **付费计划**: $5/月 + $0.50/百万请求
- **Durable Objects**: $0.15/百万请求 + 存储费用

### 预估成本（1000 并发用户）
- Worker 请求: ~$10/月
- Durable Objects: ~$15/月
- 存储: ~$5/月
- **总计**: ~$30/月

## 未来规划

### 短期目标
- [ ] 添加更多菜品和锅底
- [ ] 实现玩家等级系统
- [ ] 添加音效和背景音乐
- [ ] 移动端体验优化

### 长期目标
- [ ] AI 智能推荐菜品
- [ ] 多房间系统
- [ ] 社交功能（好友、排行榜）
- [ ] 商业化功能（虚拟货币、皮肤）

## 总结

本项目展示了如何使用现代化的边缘计算技术构建高性能的实时多人游戏。通过 Cloudflare Workers + Durable Objects 的组合，我们实现了：

1. **全球低延迟**: 边缘计算带来的性能优势
2. **强一致性**: Durable Objects 保证的状态一致性
3. **高可用性**: 无服务器架构的可靠性
4. **成本效益**: 按需付费的经济性

这种架构模式可以应用到更多的实时协作应用中，如在线白板、多人编辑器、实时聊天等场景。