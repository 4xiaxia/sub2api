import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Key, Users, BarChart3, Shield, Zap, Globe } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Sub2API</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost">登录</Button>
            </Link>
            <Link href="/register">
              <Button>注册</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI API 网关平台
          </h2>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            专业的订阅配额分发与管理系统，轻松管理您的 API 密钥、监控使用情况、控制访问权限
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8">
                立即开始
              </Button>
            </Link>
            <Link href="/dashboard/docs">
              <Button size="lg" variant="outline" className="text-lg px-8">
                查看文档
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">核心功能</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Key className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-lg">API 密钥管理</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              灵活创建、管理和撤销 API 密钥，支持自定义速率限制和令牌配额
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-lg">使用监控</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              实时追踪 API 调用情况，详细的使用统计和历史记录分析
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-lg">用户分组</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              多层级用户管理，灵活的权限控制和配额分配机制
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-lg">安全防护</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              企业级安全保障，API 密钥加密存储，Row Level Security 数据隔离
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="font-semibold text-lg">速率限制</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              精准的 RPM/TPM 速率控制，保护上游服务稳定运行
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <Globe className="h-6 w-6 text-teal-600" />
              </div>
              <h4 className="font-semibold text-lg">API 网关</h4>
            </div>
            <p className="text-slate-600 leading-relaxed">
              智能请求代理，自动计费和扣费，支持多上游服务配置
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h3 className="text-3xl font-bold mb-4">准备好开始了吗？</h3>
          <p className="text-xl mb-8 text-blue-50">
            立即注册，免费体验专业的 API 管理服务
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              免费注册
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600">
          <p>© 2026 Sub2API. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
