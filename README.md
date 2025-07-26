# 🔥 网页版模拟涮火锅游戏

基于 Cloudflare Workers + Durable Objects 的多人在线火锅游戏，支持最多 7 人同时在线，体验真实的重庆老火锅文化！

## ✨ 游戏特性

- 🍲 **重庆老火锅主题**: 鸳鸯锅设计，麻辣锅 + 清汤锅
- 👥 **多人在线**: 支持 2-7 人同时游戏
- ⚡ **实时同步**: 所有操作实时同步给同桌玩家
- 🥘 **丰富菜品**: 6大类别，40+ 种菜品
- ⏰ **真实涮煮**: 不同菜品有不同的烹饪时间
- 💬 **快捷喊话**: 重庆话特色，增强社交互动
- 📱 **响应式设计**: 支持桌面端和移动端

## 🏗️ 技术架构

### 技术栈
- **前端**: Vue.js 3 (Composition API)
- **后端**: Cloudflare Workers + Durable Objects
- **存储**: Durable Object Storage API
- **实时通信**: WebSocket
- **部署**: Cloudflare Edge Network

### 架构图

```
┌─────────────────┐    WebSocket     ┌─────────────────┐
│   客户端 (Vue)   │ ◄──────────────► │ Cloudflare      │
│                 │                  │ Worker          │
└─────────────────┘                  └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │ Durable Object  │
                                     │ (HotPotTable)   │
                                     └─────────────────┘
                                              │
                                              ▼
                                     ┌─────────────────┐
                                     │ Durable Object  │
                                     │ Storage         │
                                     └─────────────────┘
```

### 核心组件

#### 1. Cloudflare Worker (worker.js)
- 处理 HTTP 请求和 WebSocket 升级
- 根据 tableId 路由到对应的 Durable Object
- 提供静态文件服务

#### 2. Durable Object (HotPotTable.js)
- 管理单个火锅桌的所有状态
- 处理 WebSocket 连接和消息
- 实现游戏逻辑（加菜、涮煮、捞菜）
- 状态持久化到 Durable Object Storage

#### 3. 前端组件
- **HotPotGame**: 主游戏组件，管理连接和状态
- **HotPotTable**: 火锅桌场景，显示锅和座位
- **DishMenu**: 菜单组件，支持分类浏览和锅底选择

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- Cloudflare 账户
- Wrangler CLI

### 安装部署

1. **克隆项目**
```bash
git clone <repository-url>
cd hotpot-game
```

2. **安装依赖**
```bash
npm install -g wrangler
```

3. **登录 Cloudflare**
```bash
wrangler login
```

4. **开发模式**
```bash
npm run dev
```

5. **部署到生产环境**
```bash
npm run deploy
```

### 可用命令

```bash
npm run dev              # 本地开发
npm run deploy           # 部署到生产环境
npm run deploy:staging   # 部署到测试环境
npm run tail             # 查看实时日志
```

## 🎮 游戏玩法

### 基本流程
1. **加入游戏**: 输入昵称和桌子ID
2. **选择座位**: 自动分配空闲座位
3. **点击火锅**: 打开菜单选择菜品
4. **选择锅底**: 麻辣锅或清汤锅
5. **下菜涮煮**: 菜品会根据烹饪时间变化
6. **捞菜享用**: 烹饪完成后点击捞起
7. **社交互动**: 使用快捷喊话与其他玩家交流

### 菜品分类
- **镇店之宝**: 毛肚、鸭肠、黄喉、嫩牛肉
- **荤菜**: 肥牛卷、羊肉卷、虾滑、鱼豆腐等
- **素菜**: 土豆片、莲藕片、娃娃菜、金针菇等
- **丸子类**: 牛肉丸、鱼丸、墨鱼丸、虾丸等
- **主食**: 宽粉、方便面、年糕、米线等
- **豆制品**: 嫩豆腐、冻豆腐、千张、腐竹等

### 特色功能
- **烹饪时间**: 每种菜品都有真实的烹饪时间
- **锅底选择**: 支持麻辣锅和清汤锅
- **实时动画**: 菜品在锅中的浮动和变色效果
- **重庆话**: 巴适得很、安逸、雄起等地道表达

## 📁 项目结构

```
hotpot-game/
├── src/
│   ├── worker.js          # Cloudflare Worker 主入口
│   ├── HotPotTable.js     # Durable Object 游戏逻辑
│   ├── data.js            # 菜品和消息数据
│   └── styles.css         # 样式文件（已内联到 worker.js）
├── wrangler.toml          # Cloudflare 配置
├── package.json           # 项目配置
└── README.md              # 项目文档
```

## 🔧 配置说明

### wrangler.toml
```toml
name = "hotpot-game"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[durable_objects]
bindings = [
  { name = "HOTPOT_TABLE", class_name = "HotPotTable" }
]
```

### 环境变量
- 生产环境: `hotpot-game-prod`
- 测试环境: `hotpot-game-staging`

## 🌐 访问方式

部署成功后，可通过以下方式访问：

- **主页**: `https://your-worker.your-subdomain.workers.dev/`
- **指定桌子**: `https://your-worker.your-subdomain.workers.dev/table/table1`
- **API状态**: `https://your-worker.your-subdomain.workers.dev/api/tables`

## 🎯 核心特性实现

### 实时同步
- 使用 WebSocket 实现低延迟通信
- Durable Object 确保状态一致性
- 广播机制同步所有玩家状态

### 状态持久化
- Durable Object Storage 提供事务性存储
- 游戏状态在对象休眠后仍然保持
- 支持玩家断线重连

### 性能优化
- Cloudflare Edge Network 全球分发
- Durable Object 就近部署
- 前端组件懒加载和缓存

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

### 开发规范
- 使用 ES6+ 语法
- 遵循 Vue 3 Composition API 最佳实践
- 保持代码简洁和注释完整

### 提交规范
- feat: 新功能
- fix: 修复问题
- docs: 文档更新
- style: 样式调整
- refactor: 代码重构

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- Cloudflare Workers 和 Durable Objects 技术支持
- Vue.js 前端框架
- 重庆火锅文化灵感

---

**享受你的火锅时光！🔥🥢**