# Sub2API 测试指南

本文档帮助你验证 Next.js 版本的所有功能是否正常工作。

## 前提条件

1. **Supabase 项目已创建**
   - 访问 https://supabase.com
   - 创建新项目
   - 执行 `scripts/init-supabase.sql` 中的 SQL

2. **环境变量已配置**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local，填入 Supabase 配置
   ```

3. **依赖已安装**
   ```bash
   npm install
   ```

---

## 快速测试流程

### 1. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000，你应该看到：
- 美观的首页
- 导航栏有"登录"和"注册"按钮
- 功能介绍卡片

✅ **通过标准**: 页面正常显示，无控制台错误

---

### 2. 测试用户注册

#### 步骤：
1. 点击"注册"按钮或访问 http://localhost:3000/register
2. 填写表单：
   - 邮箱: test@example.com
   - 用户名: testuser
   - 显示名称: Test User
   - 密码: password123
3. 点击"注册"按钮

#### 预期结果：
- ✅ 成功：显示"Registration successful"消息
- ✅ 数据库中创建了新用户记录
- ✅ 自动跳转到登录页

#### 验证数据库：
在 Supabase SQL Editor 中运行：
```sql
SELECT id, email, username, display_name, balance, role 
FROM users 
WHERE email = 'test@example.com';
```

应该看到新创建的用户。

---

### 3. 测试用户登录

#### 步骤：
1. 访问 http://localhost:3000/login
2. 输入刚注册的账号：
   - 邮箱/用户名: test@example.com 或 testuser
   - 密码: password123
3. 点击"登录"

#### 预期结果：
- ✅ 成功登录
- ✅ 自动跳转到仪表板 `/dashboard`
- ✅ 显示用户信息和统计数据

---

### 4. 测试仪表板

#### 检查项：
- ✅ 显示欢迎消息和用户名
- ✅ 显示账户余额
- ✅ 显示使用统计（请求数、Token数、成本）
- ✅ 可以点击"API 密钥管理"、"使用历史"等链接

---

### 5. 测试 API 密钥管理

#### 步骤：
1. 在仪表板点击"API 密钥管理"
2. 点击"创建新密钥"按钮
3. 填写表单：
   - 名称: My First Key
   - RPM 限制: 60
   - TPM 限制: 100000
4. 点击"创建"

#### 预期结果：
- ✅ 成功创建 API 密钥
- ✅ 显示完整的 API 密钥（只显示一次）
- ✅ 列表中显示新密钥（密钥部分隐藏）
- ✅ 可以切换启用/禁用状态
- ✅ 可以删除密钥

#### 验证数据库：
```sql
SELECT id, user_id, name, key_hash, rpm_limit, tpm_limit, is_active
FROM api_keys
WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
```

---

### 6. 测试使用统计

#### 步骤：
1. 点击"使用历史"
2. 查看使用日志表格
3. 选择不同的时间范围（7天/30天/全部）

#### 预期结果：
- ✅ 显示使用统计汇总
- ✅ 显示详细的调用记录表格
- ✅ 可以按时间筛选
- ✅ 显示成功率

---

### 7. 测试 API 代理（高级）

#### 使用 API 密钥调用代理：

```bash
# 替换 YOUR_API_KEY 为实际的 API 密钥
curl -X POST http://localhost:3000/api/proxy \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [{"role": "user", "content": "Hello"}],
    "upstream_url": "https://api.openai.com/v1/chat/completions"
  }'
```

#### 预期结果：
- ✅ 验证 API 密钥
- ✅ 检查速率限制
- ✅ 扣除余额
- ✅ 记录使用日志
- ✅ 返回代理响应

---

### 8. 测试管理员功能

#### 创建管理员账户：
在 Supabase SQL Editor 中：
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'test@example.com';
```

#### 步骤：
1. 重新登录
2. 访问 http://localhost:3000/admin
3. 查看管理员仪表板

#### 预期结果：
- ✅ 显示系统统计（总用户数、总密钥数等）
- ✅ 可以访问用户管理页面
- ✅ 可以查看和编辑用户
- ✅ 可以调整用户余额

---

## API 端点测试

### 使用 curl 测试 API

#### 1. 注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@example.com",
    "username": "apiuser",
    "password": "password123",
    "displayName": "API User"
  }'
```

#### 2. 登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api@example.com",
    "password": "password123"
  }'
```

保存返回的 `token`。

#### 3. 获取用户信息
```bash
# 替换 YOUR_JWT_TOKEN 为登录返回的 token
curl http://localhost:3000/api/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. 创建 API 密钥
```bash
curl -X POST http://localhost:3000/api/keys \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Key",
    "rpmLimit": 60,
    "tpmLimit": 100000
  }'
```

#### 5. 获取使用统计
```bash
curl "http://localhost:3000/api/usage?days=30" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 常见问题排查

### 问题 1: 无法启动开发服务器

**错误**: `Missing Supabase environment variables`

**解决**:
```bash
# 检查 .env.local 是否存在
ls -la .env.local

# 确保包含所有必需变量
cat .env.local
```

---

### 问题 2: 注册失败

**错误**: `Failed to create user account`

**检查**:
1. Supabase SQL 是否执行成功？
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   应该看到 `users`, `api_keys`, `usage_logs` 等表。

2. 检查浏览器控制台的错误信息

---

### 问题 3: 登录后自动登出

**原因**: JWT secret 未配置或错误

**解决**:
在 `.env.local` 中添加：
```bash
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
```

---

### 问题 4: API 调用 401 错误

**检查**:
1. JWT token 是否过期（7天有效期）
2. Authorization header 格式：`Bearer YOUR_TOKEN`
3. token 是否正确（没有多余空格）

---

## 性能测试

### 并发请求测试

使用 Apache Bench (ab) 测试：

```bash
# 测试登录端点
ab -n 100 -c 10 -p login.json -T application/json \
  http://localhost:3000/api/auth/login

# login.json 内容:
# {"email": "test@example.com", "password": "password123"}
```

### 预期性能：
- 平均响应时间: < 200ms
- 错误率: 0%
- 吞吐量: > 50 req/s

---

## 自动化测试（待实现）

### 单元测试
```bash
npm test
```

### E2E 测试
```bash
npm run test:e2e
```

---

## 生产环境检查清单

在部署到生产环境前，确保：

- [ ] 所有环境变量已在 Vercel 中配置
- [ ] JWT_SECRET 使用了强随机密钥
- [ ] Supabase RLS 策略已启用
- [ ] 数据库索引已创建
- [ ] 错误日志监控已设置
- [ ] API 速率限制已配置
- [ ] CORS 策略已配置
- [ ] SSL 证书已配置
- [ ] 备份策略已设置

---

## 下一步

测试完成后：
1. 查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 了解生产部署
2. 查看 [README_USAGE.md](./README_USAGE.md) 了解完整功能
3. 查看 [MIGRATION.md](./MIGRATION.md) 了解版本迁移

---

## 获取帮助

如果遇到问题：
1. 检查浏览器控制台的错误信息
2. 查看 Supabase 日志
3. 查看 Next.js 开发服务器日志
4. 参考项目文档
