/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // 启用 React Compiler (Next.js 16 新功能)
  reactCompiler: true,
}

export default nextConfig
