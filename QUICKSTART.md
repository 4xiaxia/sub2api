# 🚀 Sub2API 快速开始指南

5 分钟完成部署！

## 前置要求

- GitHub 账号
- Vercel 账号（免费）
- Supabase 账号（免费）

## 第一步：创建 Supabase 项目

1. 访问 https://supabase.com 并登录
2. 点击 "New Project"
3. 填写项目信息：
   - Name: `sub2api`
   - Database Password: 设置一个强密码（记住它）
   - Region: 选择离你最近的区域
4. 点击 "Create new project"
5. 等待项目创建完成（约 2 分钟）

## 第二步：初始化数据库

1. 在 Supabase 项目页面，点击左侧菜单的 "SQL Editor"
2. 点击 "New query"
3. 打开本项目的 `scripts/init-supabase.sql` 文件
4. 复制所有内容
5. 粘贴到 Supabase SQL Editor
6. 点击 "Run" 执行脚本
7. 确认看到 "Success" 消息

## 第三步：获取 Supabase 密钥

1. 在 Supabase 项目页面，点击左侧菜单的 "Settings" → "API"
2. 找到以下信息并复制保存：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（点击"Reveal"显示）

⚠️ **警告**: service_role key 是高权限密钥，请妥善保管！

## 第四步：部署到 Vercel

### 方法 A：通过 GitHub (推荐)

1. Fork 或 push 本项目到你的 GitHub
2. 访问 https://vercel.com 并登录
3. 点击 "Add New..." → "Project"
4. 导入你的 GitHub 仓库
5. 在 "Environment Variables" 中添加：

```
NEXT_PUBLIC_SUPABASE_URL=你的Project_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon_public_key
SUPABASE_SERVICE_ROLE_KEY=你的service_role_secret
```

6. 点击 "Deploy"
7. 等待部署完成（约 2-3 分钟）

### 方法 B：通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel

# 添加环境变量
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 生产部署
vercel --prod
```

## 第五步：创建管理员账户

### 方式 1: 通过 Web 界面注册

1. 访问你的部署地址 `https://your-app.vercel.app/register`
2. 注册一个新账户
3. 记住用户名

### 方式 2: 在 Supabase 中设置管理员

1. 在 Supabase，打开 "SQL Editor"
2. 运行以下 SQL：

```sql
-- 将用户设置为管理员
UPDATE users 
SET role = 'admin' 
WHERE username = '你的用户名';
```

3. 刷新页面，你现在是管理员了！

## ✅ 完成！开始使用

访问以下页面：

- **首页**: `https://your-app.vercel.app/`
- **登录**: `https://your-app.vercel.app/login`
- **仪表板**: `https://your-app.vercel.app/dashboard`
- **管理后台**: `https://your-app.vercel.app/admin` (需要管理员权限)

## 快速测试

### 1. 创建 API 密钥

1. 登录后访问 `/dashboard/keys`
2. 点击 "创建新密钥"
3. 填写配置：
   - 名称: "测试密钥"
   - RPM 限制: 60
   - TPM 限制: 10000
4. 创建并复制密钥（只显示一次！）

### 2. 测试 API 调用

```bash
curl -X POST https://your-app.vercel.app/api/proxy \
  -H "Authorization: Bearer 你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 3. 查看使用统计

访问 `/dashboard/usage` 查看刚才的调用记录。

## 常见问题

### Q: 部署后页面空白？

**A**: 检查浏览器控制台错误，通常是环境变量未正确配置。

### Q: 无法连接数据库？

**A**: 确认环境变量正确，特别是 URL 末尾不要有斜杠。

### Q: SQL 脚本执行失败？

**A**: 确保复制了完整的脚本内容，不要遗漏任何部分。

### Q: 如何重置密码？

**A**: 目前需要在 Supabase 中手动更新：

```sql
-- 在 SQL Editor 中运行
UPDATE users 
SET password_hash = '$2a$10$...' -- 使用 bcrypt 生成新密码哈希
WHERE username = '用户名';
```

### Q: 如何充值余额？

**A**: 管理员可以在 `/admin/users` 中调整用户余额。

## 下一步

- 📖 阅读完整 [使用指南](./README_USAGE.md)
- 🚀 查看 [部署指南](./DEPLOYMENT.md)
- 📊 查看 [项目状态](./PROJECT_STATUS.md)
- 🔧 自定义配置和功能

## 获取帮助

- 查看项目文档
- 提交 GitHub Issue
- 查看 Supabase 和 Vercel 官方文档

---

**恭喜！** 你的 Sub2API 已经成功部署并运行了！🎉
