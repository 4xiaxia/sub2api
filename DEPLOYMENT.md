# Sub2API 部署指南

## 部署前准备

### 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目
3. 记录以下信息：
   - Project URL
   - Anon (public) Key
   - Service Role Key

### 2. 初始化数据库

1. 在 Supabase Dashboard 中打开 SQL Editor
2. 复制并执行 `scripts/init-supabase.sql` 中的全部内容
3. 确认所有表和策略创建成功：
   - users
   - api_keys
   - usage_logs
   - subscriptions
   - groups

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# Supabase 配置（必需）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. 部署到 Vercel

#### 方法一：通过 Vercel Dashboard

1. 登录 Vercel
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置环境变量
5. 点击 "Deploy"

#### 方法二：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 配置环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 重新部署
vercel --prod
```

## 部署后配置

### 1. 创建管理员账户

```sql
-- 在 Supabase SQL Editor 中执行
UPDATE users 
SET role = 'admin' 
WHERE username = 'your_username';
```

### 2. 配置 CORS（如需）

在 Supabase Dashboard 的 Settings > API 中配置允许的域名。

### 3. 测试部署

访问以下页面确认部署成功：

- `/` - 首页
- `/register` - 注册页面
- `/login` - 登录页面
- `/dashboard` - 用户仪表板（需登录）
- `/admin` - 管理后台（需管理员权限）

## 性能优化

### 1. 数据库索引

数据库初始化脚本已包含以下索引：

- users: username, email
- api_keys: user_id, key_hash, is_active
- usage_logs: user_id, api_key_id, created_at
- subscriptions: user_id, status

### 2. Vercel 配置

在 `vercel.json` 中可以配置：

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PUT,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ]
}
```

### 3. 缓存策略

使用 SWR 的缓存功能：

```typescript
// 在组件中使用
const { data } = useSWR('/api/keys', fetcher, {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 60000 // 60秒
})
```

## 监控和维护

### 1. Supabase Dashboard

监控以下指标：
- Database size
- Active connections
- API requests per day
- Slow queries

### 2. Vercel Analytics

启用 Vercel Analytics 监控：
- 页面访问量
- 响应时间
- 错误率

### 3. 定期备份

在 Supabase Dashboard 中配置自动备份：
- Settings > Database > Backups
- 建议每日备份

## 故障排查

### 问题 1: 无法连接数据库

**解决方案**:
- 检查环境变量是否正确
- 确认 Supabase 项目状态正常
- 检查网络连接

### 问题 2: RLS 策略导致无法访问数据

**解决方案**:
```sql
-- 临时禁用 RLS 进行测试
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 检查策略
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 重新启用
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 问题 3: API 密钥验证失败

**解决方案**:
- 确认密钥格式正确
- 检查密钥是否已激活
- 查看 usage_logs 表中的错误信息

### 问题 4: 部署后页面空白

**解决方案**:
- 检查浏览器控制台错误
- 确认所有环境变量已设置
- 查看 Vercel 部署日志

## 安全检查清单

- [ ] 所有环境变量已正确配置
- [ ] Supabase RLS 策略已启用
- [ ] API 密钥使用 SHA-256 哈希存储
- [ ] 管理员账户使用强密码
- [ ] CORS 配置正确
- [ ] 敏感数据不在客户端暴露
- [ ] 启用 HTTPS (Vercel 自动提供)
- [ ] 定期更新依赖包

## 扩展性建议

### 水平扩展

- Supabase 自动处理数据库扩展
- Vercel 自动处理应用扩展
- 考虑使用 Redis 缓存热点数据

### 多区域部署

在 Vercel 中配置 Edge Network：

```json
{
  "regions": ["iad1", "sfo1", "hnd1"]
}
```

### 负载均衡

使用 Vercel 的自动负载均衡，或配置自定义负载均衡器。

## 成本优化

### Supabase

- Free tier: 500MB 数据库, 2GB 传输
- Pro tier: $25/月起
- 根据使用量选择合适计划

### Vercel

- Hobby: 免费，适合个人项目
- Pro: $20/月，适合商业项目
- Enterprise: 自定义定价

### 优化建议

1. 定期清理旧的使用日志
2. 使用 Supabase 的连接池
3. 启用 API 响应缓存
4. 压缩静态资源

## 更新和迁移

### 应用更新

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
npm install

# 部署
vercel --prod
```

### 数据库迁移

1. 备份现有数据
2. 创建迁移脚本
3. 在测试环境验证
4. 在生产环境执行
5. 验证数据完整性

## 支持和资源

- [Next.js 文档](https://nextjs.org/docs)
- [Supabase 文档](https://supabase.com/docs)
- [Vercel 文档](https://vercel.com/docs)
- [项目 GitHub Issues](https://github.com/your-repo/issues)
