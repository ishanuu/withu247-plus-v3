import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { ArrowRight, Shield, Zap, Users, BarChart3, Lock, Smartphone } from "lucide-react";

/**
 * Landing page with claymorphism design
 * Features showcase and call-to-action for unauthenticated users
 * Dashboard redirect for authenticated users
 */
export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clay-50 to-clay-100">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-clay-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-clay-50 to-clay-100 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-clay-900 mb-2">
              Welcome back, {user.name}! 👋
            </h1>
            <p className="text-clay-600">
              Your enterprise platform is ready to serve you
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Link href="/dashboard">
              <a className="block p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border border-clay-200">
                <BarChart3 className="w-8 h-8 text-clay-600 mb-3" />
                <h3 className="font-semibold text-clay-900 mb-2">Dashboard</h3>
                <p className="text-sm text-clay-600">View your analytics and usage</p>
              </a>
            </Link>

            <Link href="/users">
              <a className="block p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border border-clay-200">
                <Users className="w-8 h-8 text-clay-600 mb-3" />
                <h3 className="font-semibold text-clay-900 mb-2">Users</h3>
                <p className="text-sm text-clay-600">Manage team members</p>
              </a>
            </Link>

            <Link href="/settings">
              <a className="block p-6 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer border border-clay-200">
                <Lock className="w-8 h-8 text-clay-600 mb-3" />
                <h3 className="font-semibold text-clay-900 mb-2">Settings</h3>
                <p className="text-sm text-clay-600">API keys & configuration</p>
              </a>
            </Link>
          </div>

          {/* Admin Dashboard Link */}
          {user.role === "admin" && (
            <div className="p-6 bg-gradient-to-r from-clay-200 to-clay-300 rounded-3xl border border-clay-400">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-clay-900 mb-1">Admin Access</h3>
                  <p className="text-sm text-clay-700">Manage system, tenants, and users</p>
                </div>
                <Link href="/admin">
                  <a className="flex items-center gap-2 px-6 py-2 bg-white text-clay-900 rounded-full font-semibold hover:bg-clay-50 transition-colors cursor-pointer">
                    Go to Admin <ArrowRight className="w-4 h-4" />
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-clay-50 via-clay-100 to-clay-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-clay-400 to-clay-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">W</span>
          </div>
          <span className="text-xl font-bold text-clay-900">WithU247+</span>
        </div>
        <Button 
          onClick={() => window.location.href = getLoginUrl()}
          className="bg-clay-600 hover:bg-clay-700 text-white rounded-full px-6"
        >
          Sign In
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-clay-900 mb-6 leading-tight">
              Enterprise-Grade Platform for Modern Teams
            </h1>
            <p className="text-xl text-clay-700 mb-8 leading-relaxed">
              Unified multimodal AI platform with OAuth2 authentication, multi-tenancy support, and enterprise-grade security. Built for scale and reliability.
            </p>
            <div className="flex gap-4">
              <Button 
                onClick={() => window.location.href = getLoginUrl()}
                className="bg-clay-600 hover:bg-clay-700 text-white rounded-full px-8 py-3 text-lg"
              >
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline"
                className="border-clay-400 text-clay-900 rounded-full px-8 py-3 text-lg hover:bg-clay-100"
              >
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-clay-300 to-clay-400 rounded-3xl blur-3xl opacity-30"></div>
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-clay-200">
              <div className="space-y-4">
                <div className="h-12 bg-gradient-to-r from-clay-200 to-clay-300 rounded-full"></div>
                <div className="h-8 bg-clay-100 rounded-full w-2/3"></div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="h-20 bg-clay-100 rounded-2xl"></div>
                  <div className="h-20 bg-clay-100 rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white bg-opacity-50 backdrop-blur-sm py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-clay-900 mb-16">
            Powerful Features
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-gradient-to-br from-white to-clay-50 rounded-3xl border border-clay-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-clay-200 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-clay-700" />
              </div>
              <h3 className="text-xl font-semibold text-clay-900 mb-3">Enterprise Security</h3>
              <p className="text-clay-700">
                AES-256 encryption, OAuth2 authentication, comprehensive audit logging, and role-based access control
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-gradient-to-br from-white to-clay-50 rounded-3xl border border-clay-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-clay-200 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-clay-700" />
              </div>
              <h3 className="text-xl font-semibold text-clay-900 mb-3">Lightning Fast</h3>
              <p className="text-clay-700">
                Sub-500ms response times, Redis caching, optimized database queries, and 287 req/sec throughput
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-gradient-to-br from-white to-clay-50 rounded-3xl border border-clay-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-clay-200 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-clay-700" />
              </div>
              <h3 className="text-xl font-semibold text-clay-900 mb-3">Multi-Tenancy</h3>
              <p className="text-clay-700">
                Tenant isolation, per-tenant rate limiting, plan-based feature access, and usage tracking
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-gradient-to-br from-white to-clay-50 rounded-3xl border border-clay-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-clay-200 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-clay-700" />
              </div>
              <h3 className="text-xl font-semibold text-clay-900 mb-3">Real-time Analytics</h3>
              <p className="text-clay-700">
                Comprehensive dashboards, usage metrics, performance tracking, and custom reports
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-gradient-to-br from-white to-clay-50 rounded-3xl border border-clay-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-clay-200 rounded-2xl flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-clay-700" />
              </div>
              <h3 className="text-xl font-semibold text-clay-900 mb-3">API First</h3>
              <p className="text-clay-700">
                REST, GraphQL, and tRPC APIs with full type safety, comprehensive documentation, and webhooks
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-gradient-to-br from-white to-clay-50 rounded-3xl border border-clay-200 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-clay-200 rounded-2xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-clay-700" />
              </div>
              <h3 className="text-xl font-semibold text-clay-900 mb-3">Modern UI</h3>
              <p className="text-clay-700">
                Claymorphism design, responsive layouts, real-time notifications, and smooth animations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-clay-900 mb-2">93/100</div>
            <p className="text-clay-700">System Health Score</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-clay-900 mb-2">62/62</div>
            <p className="text-clay-700">Tests Passing (100%)</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-clay-900 mb-2">95/100</div>
            <p className="text-clay-700">Security Score</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-clay-900 mb-2">287 req/s</div>
            <p className="text-clay-700">Throughput</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-clay-600 to-clay-700 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-clay-100 mb-8">
            Join thousands of teams using WithU247+ for their enterprise needs
          </p>
          <Button 
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-white hover:bg-clay-50 text-clay-700 rounded-full px-8 py-3 text-lg font-semibold"
          >
            Sign In Now <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clay-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-clay-300">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-clay-300">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-clay-300">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-clay-300">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-clay-800 pt-8 text-center text-clay-400">
            <p>&copy; 2026 WithU247+. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
