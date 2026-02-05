# Sub2API 使用指南

## 项目简介

Sub2API 是一个基于 Next.js 16 和 Supabase 构建的现代化 AI API 网关平台，专为订阅配额分发与管理而设计。

### 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **UI 组件**: Shadcn UI + Radix UI + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **身份验证**: Supabase Auth
- **状态管理**: SWR (React Hooks for Data Fetching)
- **表单处理**: React Hook Form + Zod

## 核心功能

### 1. 用户管理
- 用户注册和登录
- 个人资料管理
- 账户余额管理
- 多用户隔离 (Row Level Security)

### 2. API 密钥管理
- 创建和管理 API 密钥
- 自定义密钥名称和描述
- 设置速率限制 (RPM/TPM)
- 配置令牌配额
- 启用/禁用密钥
- 安全的密钥哈希存储

### 3. 使用监控
- 实时使用统计
- 详细的调用日志
- 按时间范围筛选
- 令牌消耗追踪
- 成功率分析

### 4. 订阅系统
- 多层级订阅计划
- 自动续费管理
- 配额分配
- 账单历史

### 5. API 网关
- 智能请求代理
- 自动鉴权和计费
- 速率限制执行
- 错误处理和日志

### 6. 管理员功能
- 用户管理
- 系统统计
- 配额调整
- 账户充值

## 快速开始

### 环境配置

在 Vercel 项目中设置以下环境变量：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 数据库初始化

1. 在 Supabase 项目中执行 `scripts/init-supabase.sql` 脚本
2. 脚本会自动创建所有必要的表和 RLS 策略

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 部署

项目已配置 Vercel 自动部署，只需：

1. 连接 GitHub 仓库到 Vercel
2. 配置环境变量
3. 点击部署

## 使用教程

### 1. 注册账户

访问 `/register` 页面，填写以下信息：
- 用户名 (唯一)
- 邮箱
- 密码 (至少 6 位)

### 2. 登录系统

访问 `/login` 页面，使用用户名或邮箱登录。

### 3. 创建 API 密钥

1. 进入 `/dashboard/keys` 页面
2. 点击"创建新密钥"按钮
3. 配置密钥参数：
   - **名称**: 便于识别的密钥名称
   - **RPM 限制**: 每分钟请求次数限制
   - **TPM 限制**: 每分钟令牌数限制
   - **分组 ID**: (可选) 所属分组
4. 点击创建，系统会生成一个唯一的 API 密钥
5. **重要**: 立即复制保存密钥，密钥只会显示一次

### 4. 使用 API 密钥

通过 API 网关发送请求：

```bash
curl -X POST https://your-domain.com/api/proxy \
  -H "Authorization: Bearer your_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 5. 监控使用情况

访问 `/dashboard/usage` 页面查看：
- 总调用次数
- 总消耗令牌
- 成功/失败统计
- 详细日志记录

### 6. 管理订阅

访问 `/dashboard/subscriptions` 页面：
- 查看当前订阅计划
- 升级或降级计划
- 查看账单历史

## API 接口文档

### 认证接口

#### 注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "password123"
}
```

#### 登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user123",  // 用户名或邮箱
  "password": "password123"
}
```

### API 密钥管理

#### 获取密钥列表
```http
GET /api/keys
Authorization: Bearer {user_session_token}
```

#### 创建密钥
```http
POST /api/keys
Authorization: Bearer {user_session_token}
Content-Type: application/json

{
  "name": "我的密钥",
  "description": "用于生产环境",
  "rpm_limit": 60,
  "tpm_limit": 10000,
  "token_quota": 1000000
}
```

#### 更新密钥
```http
PUT /api/keys
Authorization: Bearer {user_session_token}
Content-Type: application/json

{
  "id": "key_id",
  "is_active": false
}
```

### 使用统计

#### 获取使用记录
```http
GET /api/usage?start_date=2026-01-01&end_date=2026-02-01
Authorization: Bearer {user_session_token}
```

### API 网关

#### 代理请求
```http
POST /api/proxy
Authorization: Bearer {api_key}
Content-Type: application/json

{
  "model": "gpt-4",
  "messages": [...],
  "stream": false
}
```

## 数据库架构

### 核心表

- **users**: 用户信息
  - id, username, email, balance, role
  
- **api_keys**: API 密钥
  - id, user_id, key_hash, name, rpm_limit, tpm_limit, is_active
  
- **usage_logs**: 使用日志
  - id, user_id, api_key_id, tokens_used, cost, success, error_message
  
- **subscriptions**: 订阅信息
  - id, user_id, plan_type, status, start_date, end_date
  
- **groups**: 用户分组
  - id, name, admin_id, total_quota, used_quota

### Row Level Security (RLS)

所有表都启用了 RLS 策略，确保：
- 用户只能访问自己的数据
- 管理员可以访问所有数据
- API 密钥查询有专门的安全策略

## 安全最佳实践

1. **API 密钥保护**
   - 永远不要在客户端代码中暴露密钥
   - 定期轮换密钥
   - 为不同用途创建不同的密钥

2. **速率限制**
   - 合理设置 RPM/TPM 限制
   - 监控异常使用模式

3. **账户安全**
   - 使用强密码
   - 定期检查使用日志
   - 及时禁用可疑密钥

4. **数据隔离**
   - 利用 RLS 策略保护数据
   - 不同环境使用不同密钥

## 常见问题

### Q: 如何充值账户余额？
A: 管理员可以通过管理后台调整用户余额。未来版本将支持自助充值。

### Q: API 密钥丢失了怎么办？
A: 密钥创建后只显示一次，如果丢失，需要创建新密钥并删除旧密钥。

### Q: 速率限制如何计算？
A: RPM 在滑动窗口内计算，TPM 基于实际消耗的令牌数。

### Q: 如何成为管理员？
A: 管理员需要在数据库中手动设置 role 字段为 'admin'。

### Q: 支持哪些上游 API？
A: 目前支持标准的 OpenAI API 格式，可以配置不同的上游 URL。

## 开发路线图

- [ ] Stripe 支付集成
- [ ] 邮件通知系统
- [ ] API 密钥使用分析图表
- [ ] Webhook 支持
- [ ] 多上游负载均衡
- [ ] API 密钥权限细分
- [ ] 团队协作功能
- [ ] 详细的审计日志

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 技术支持

如有问题，请访问 GitHub Issues 或联系技术支持。
