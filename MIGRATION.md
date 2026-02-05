# Sub2API 迁移指南

## 项目版本说明

本项目现在包含两个版本：

### 旧版本（Go + Vue）⚠️
- **位置**: `backend/` 目录
- **技术栈**: Go 1.25 + Gin + Ent ORM + PostgreSQL + Redis
- **状态**: 已停止维护，保留用于参考
- **说明**: 原始的 Go 后端实现，功能完整但不再更新

### 新版本（Next.js）✅ **推荐使用**
- **位置**: 根目录（`app/`, `lib/`, `components/` 等）
- **技术栈**: Next.js 16 + React 19 + TypeScript + Supabase
- **状态**: 活跃开发，功能完整
- **说明**: 完全重写的全栈应用，使用现代化技术栈

---

## 🚀 使用新版本

### 快速开始

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 Supabase 配置

# 3. 初始化数据库
# 在 Supabase SQL Editor 中执行 scripts/init-supabase.sql

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 环境变量配置

在 `.env.local` 中配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 新版本目录结构

```
sub2api/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── dashboard/         # 用户仪表板
│   ├── admin/            # 管理员后台
│   ├── login/            # 登录页
│   └── register/         # 注册页
├── components/            # React 组件
│   └── ui/               # Shadcn UI 组件
├── lib/                   # 工具库
│   ├── context/          # React Context
│   ├── supabase/         # Supabase 客户端
│   └── types/            # TypeScript 类型
├── scripts/              # 数据库脚本
│   └── init-supabase.sql # 数据库初始化
├── public/               # 静态资源
└── package.json          # 项目依赖
```

---

## ⚠️ 旧版本使用（不推荐）

如果你需要运行旧的 Go 版本：

### 前提条件
- Go 1.25+
- PostgreSQL 15+
- Redis 7+
- Node.js（用于前端）

### 启动步骤

```bash
# 1. 进入后端目录
cd backend

# 2. 安装 Go 依赖
go mod download

# 3. 配置数据库
# 编辑 config.yaml，配置 PostgreSQL 和 Redis

# 4. 运行数据库迁移
make migrate

# 5. 启动后端
make run

# 6. 启动前端（另一个终端）
cd frontend
npm install
npm run dev
```

**注意**: 旧版本需要手动配置多个服务，部署复杂度较高。

---

## 🔄 从旧版本迁移到新版本

### 数据迁移

如果你有旧版本的数据需要迁移：

1. **导出旧数据**
   ```bash
   # 从 PostgreSQL 导出数据
   pg_dump -h localhost -U postgres -d sub2api > old_data.sql
   ```

2. **转换数据格式**
   - 旧版本使用的表结构与新版本不同
   - 需要编写转换脚本（可以使用 Python/Node.js）
   - 参考 `scripts/migration/` 目录中的示例脚本（待创建）

3. **导入新数据库**
   - 在 Supabase 中执行转换后的 SQL

### API 端点对比

| 功能 | 旧版本 (Go) | 新版本 (Next.js) |
|------|-------------|------------------|
| 用户注册 | `POST /api/v1/auth/register` | `POST /api/auth/register` |
| 用户登录 | `POST /api/v1/auth/login` | `POST /api/auth/login` |
| 获取 API Keys | `GET /api/v1/keys` | `GET /api/keys` |
| 创建 API Key | `POST /api/v1/keys` | `POST /api/keys` |
| 使用统计 | `GET /api/v1/usage` | `GET /api/usage` |
| API 代理 | `POST /api/v1/proxy` | `POST /api/proxy` |

### 主要差异

| 方面 | 旧版本 | 新版本 |
|------|--------|--------|
| 后端语言 | Go | TypeScript/Node.js |
| 前端框架 | Vue 3 | Next.js 16 (React 19) |
| 数据库 | 自建 PostgreSQL | Supabase (托管 PostgreSQL) |
| 认证系统 | 自定义 JWT | Supabase Auth + bcrypt |
| ORM | Ent | Supabase Client |
| 缓存 | Redis | 无需额外缓存（使用 SWR） |
| 部署复杂度 | 高（需要多个服务） | 低（单个 Vercel 应用） |
| API 风格 | RESTful | RESTful |
| 速率限制 | Redis + 自定义 | 数据库存储 + API 验证 |

---

## 🗂️ 旧版本代码保留说明

### 为什么保留旧代码？

1. **参考价值**: 保留原始实现逻辑供参考
2. **完整性**: 保持 Git 历史完整
3. **回退选项**: 极端情况下可以回退到旧版本

### 旧代码位置

所有旧版本代码都在 `backend/` 目录下：
- `backend/cmd/` - Go 主程序
- `backend/internal/` - Go 内部包
- `backend/ent/` - Ent ORM 生成代码
- `backend/migrations/` - 数据库迁移

### 清理旧代码

如果确定不再需要旧版本，可以删除：

```bash
# ⚠️ 警告：此操作不可逆
rm -rf backend/
```

但建议保留，直到新版本在生产环境稳定运行至少 1 个月。

---

## 📊 功能完整度对比

| 功能 | 旧版本 | 新版本 | 说明 |
|------|--------|--------|------|
| 用户注册/登录 | ✅ | ✅ | 新版本使用 Supabase Auth |
| API 密钥管理 | ✅ | ✅ | 功能对等 |
| 速率限制 (RPM/TPM) | ✅ | ✅ | 实现方式不同 |
| 使用统计 | ✅ | ✅ | 新版本更简洁 |
| 用户分组 | ✅ | ✅ | 数据库表结构略有不同 |
| 管理员后台 | ✅ | ✅ | UI 更现代化 |
| API 代理/网关 | ✅ | ✅ | 核心功能保持 |
| OAuth 集成 | ✅ | ⏳ | 计划中 |
| Redis 缓存 | ✅ | ❌ | 使用 SWR 客户端缓存 |
| 并发控制 | ✅ | ⏳ | 计划中 |
| 邮件通知 | ✅ | ⏳ | 计划中 |
| 多上游账户 | ✅ | ⏳ | 简化版已实现 |

**图例**: ✅ 已完成 | ⏳ 计划中 | ❌ 不需要

---

## 🎯 推荐使用新版本的理由

### 技术优势
1. **更简单的部署**: 一键部署到 Vercel，无需配置多个服务
2. **更低的维护成本**: 托管数据库和认证，减少运维负担
3. **更快的开发速度**: TypeScript + React 生态系统成熟
4. **更好的开发体验**: 热重载、类型检查、现代工具链

### 成本优势
1. **免费额度**: Vercel 和 Supabase 都提供免费层
2. **无需服务器**: 不需要自己维护 VPS
3. **自动扩展**: 根据流量自动扩容

### 安全优势
1. **托管认证**: Supabase Auth 专业的认证系统
2. **RLS 隔离**: 行级别安全策略保护数据
3. **自动更新**: 依赖包自动安全更新

---

## 📞 获取帮助

- **文档**: 查看 [README_USAGE.md](./README_USAGE.md)
- **快速开始**: 查看 [QUICKSTART.md](./QUICKSTART.md)
- **部署指南**: 查看 [DEPLOYMENT.md](./DEPLOYMENT.md)
- **项目状态**: 查看 [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## 📝 更新日志

- **2026-02-05**: 完成 Next.js 版本重写，功能对等
- **2026-01-XX**: 开始 Next.js 迁移项目
- **2025-XX-XX**: Go 版本最后一次更新

---

**建议**: 新项目直接使用 Next.js 版本，旧项目逐步迁移。
