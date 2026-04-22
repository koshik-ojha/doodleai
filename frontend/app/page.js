"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Zap, BarChart3, Globe, ArrowRight, CheckCircle,
  Sparkles, Users, TrendingUp, Code, Rocket, Star, ChevronDown, LogIn, UserPlus,
  Bell, Send, Smartphone
} from "lucide-react";
import BotWidget, { SvgIcon as BotIcon } from "@components/BotWidget";
import ChatWidget from "@components/ChatWidget";
import Logo from "@images/logo.svg";
import LightLogo from "@images/light-logo.svg";
import { useTheme } from "@context/ThemeContext";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 text-gray-900 dark:text-white overflow-x-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-[500px] h-[500px] bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 dark:border-zinc-800/50 backdrop-blur-xl bg-white/80 dark:bg-zinc-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-0 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src={theme === 'light' ? LightLogo : Logo} alt="Doodle AI" className="h-9 sm:h-10 md:h-12 w-auto" />
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button
              onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 border border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-all flex items-center justify-center gap-2 touch-manipulation"
              title="Login"
            >
              <LogIn size={20} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm font-medium">Login</span>
            </button>
            <button
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-5 md:px-6 sm:py-2.5 border border-purple-600 dark:border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-all flex items-center justify-center gap-2 touch-manipulation"
              title="Get Started"
            >
              <UserPlus size={20} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm font-medium">Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 sm:pt-28 md:pt-32 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-sm sm:text-base">
                <Sparkles size={18} className="sm:w-5 sm:h-5" />
                <span>Powered by Advanced AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-900 to-gray-600 dark:from-white dark:via-white dark:to-zinc-400 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-600 via-purple-700 to-blue-700 dark:from-purple-400 dark:via-purple-500 dark:to-blue-500 bg-clip-text text-transparent">
                  Customer Support
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                Deploy intelligent Doodle AIs in minutes. Engage visitors, capture leads,
                and provide 24/7 support with our powerful chatbot platform.
              </p>

              <div className="flex flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="group px-5 sm:px-9 py-3 sm:py-4 !text-sm sm:text-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl text-white font-semibold transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2 touch-manipulation"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 sm:px-9 py-3 sm:py-4 !text-sm sm:text-lg bg-white dark:bg-zinc-800/50 hover:bg-gray-100 dark:hover:bg-zinc-800 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white font-semibold transition-all flex items-center justify-center gap-2 touch-manipulation"
                >
                  See How It Works
                  <ChevronDown size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-200 dark:border-zinc-800">
                {[
                  { value: "10k+", label: "Active Users" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "500k+", label: "Conversations" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm sm:text-base text-gray-600 dark:text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900/80 dark:to-zinc-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-zinc-700/50 p-6 sm:p-8 shadow-2xl">
                {/* Mock Chat Interface */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-zinc-700">
                    <BotIcon size={44} />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">Support Assistant</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <BotIcon size={36} className="flex-shrink-0" />
                    <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        Hello! How can I help you today?
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="bg-gray-200 dark:bg-zinc-700/50 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        I need help with pricing
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <BotIcon size={36} className="flex-shrink-0" />
                    <div className="bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-800 dark:text-gray-200">
                        I'd be happy to help! Our plans start at $29/month...
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
                  AI Powered
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  24/7 Support
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-100/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm sm:text-base mb-4">
              <Star size={18} className="sm:w-5 sm:h-5" />
              <span>Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              Powerful features to enhance customer engagement and streamline support
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: MessageSquare,
                title: "Smart Conversations",
                description: "AI-powered responses that understand context and provide accurate answers instantly.",
                color: "purple"
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Deploy in minutes with our simple integration. No coding required.",
                color: "yellow"
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Track performance, user behavior, and conversation insights in real-time.",
                color: "blue"
              },
              {
                icon: Globe,
                title: "Multi-Platform",
                description: "Integrate seamlessly across websites, mobile apps, and social platforms.",
                color: "green"
              },
              {
                icon: Users,
                title: "Lead Capture",
                description: "Collect visitor information with intelligent forms embedded in conversations.",
                color: "pink"
              },
              {
                icon: TrendingUp,
                title: "Auto-Learning",
                description: "Continuously improves from interactions to deliver better responses over time.",
                color: "cyan"
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-zinc-800/30 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} className={`text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Telegram Integration Highlight Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/30 dark:via-zinc-900/50 dark:to-purple-950/30 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-sm sm:text-base backdrop-blur-xl">
                <Sparkles size={18} className="sm:w-5 sm:h-5" />
                <span>New Feature</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
                  Get Leads Instantly on
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500 bg-clip-text text-transparent ms-2">
                  Telegram
                </span>
                </span>
              </h2>

              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
                Never miss a lead again! Receive instant notifications on Telegram whenever a visitor submits information through your chatbot. Stay connected, respond faster, and close more deals.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Bell, title: "Real-Time Alerts", desc: "Get notified the moment a lead comes in" },
                  { icon: Smartphone, title: "Mobile-First", desc: "Access leads anywhere, anytime on your phone" },
                  { icon: Zap, title: "Lightning Fast", desc: "Respond to prospects while they're still engaged" },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4 bg-white dark:bg-zinc-800/40 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-xl text-white font-semibold transition-all shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 flex items-center gap-2"
                >
                  Try It Free Now
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                  <CheckCircle size={18} className="text-green-500 dark:text-green-400" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right Visual - Telegram Notification Preview */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-blue-900/40 dark:via-zinc-900/80 dark:to-zinc-800/80 backdrop-blur-xl rounded-3xl border border-blue-300 dark:border-blue-500/30 p-6 sm:p-8 shadow-2xl shadow-blue-200 dark:shadow-blue-500/20">
                {/* Telegram Chat Header */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-zinc-700/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Send size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Doodle AI Bot</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Lead Notifications</div>
                  </div>
                </div>

                {/* Notification Messages */}
                <div className="space-y-4 mt-6">
                  <div className="bg-blue-100 dark:bg-blue-600/20 border border-blue-300 dark:border-blue-500/30 rounded-2xl rounded-tl-sm px-4 py-3 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">New Lead Received!</span>
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
                      <p><span className="font-semibold">Name:</span> Sarah Johnson</p>
                      <p><span className="font-semibold">Email:</span> sarah@techstart.com</p>
                      <p><span className="font-semibold">Phone:</span> +1 234-567-8900</p>
                      <p><span className="font-semibold">Company:</span> TechStart Inc.</p>
                      <p className="pt-2 text-gray-700 dark:text-gray-300">💬 "Interested in Enterprise plan for 50 agents"</p>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">Just now</div>
                  </div>

                  <div className="bg-gray-100 dark:bg-zinc-800/40 border border-gray-300 dark:border-zinc-700/50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell size={16} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">New Lead Received!</span>
                    </div>
                    <div className="text-sm text-gray-800 dark:text-gray-300 space-y-1">
                      <p><span className="font-semibold">Name:</span> Michael Chen</p>
                      <p><span className="font-semibold">Email:</span> m.chen@growth.io</p>
                      <p className="pt-1 text-gray-600 dark:text-gray-400">💬 "Need pricing for startup plan"</p>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">2 minutes ago</div>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                  ✓ Connected
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Bottom Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800/50">
            {[
              { value: "<1s", label: "Notification Speed" },
              { value: "100%", label: "Delivery Rate" },
              { value: "24/7", label: "Always On" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-sm sm:text-base mb-4">
              <Globe size={18} className="sm:w-5 sm:h-5" />
              <span>Perfect For Every Industry</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Built for Your Business
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              From startups to enterprises, Doodle AI adapts to your unique needs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                industry: "E-Commerce",
                icon: "🛒",
                description: "Guide shoppers, answer product questions, and increase conversions 24/7",
                benefits: ["Product recommendations", "Order tracking", "Cart recovery"]
              },
              {
                industry: "SaaS",
                icon: "💻",
                description: "Reduce support tickets, onboard users faster, and boost retention",
                benefits: ["Feature guidance", "Technical support", "User onboarding"]
              },
              {
                industry: "Healthcare",
                icon: "🏥",
                description: "Schedule appointments, answer FAQs, and improve patient experience",
                benefits: ["Appointment booking", "24/7 availability", "HIPAA compliant"]
              },
              {
                industry: "Education",
                icon: "🎓",
                description: "Support students, answer admissions questions, streamline enrollment",
                benefits: ["Course information", "Admissions help", "Campus support"]
              },
            ].map((useCase, i) => (
              <div key={i} className="group bg-white dark:bg-zinc-800/30 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 hover:-translate-y-1">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {useCase.industry}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {useCase.description}
                </p>
                <ul className="space-y-2">
                  {useCase.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-100/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm sm:text-base mb-4">
              <Users size={18} className="sm:w-5 sm:h-5" />
              <span>Trusted by Thousands</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                What Our Customers Say
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              Join thousands of businesses transforming their customer experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "CEO, TechStart",
                content: "Doodle AI increased our response time by 80% and customer satisfaction scores are through the roof. Best investment we've made this year.",
                rating: 5,
                avatar: "SJ"
              },
              {
                name: "Michael Chen",
                role: "Marketing Director, GrowthCo",
                content: "The AI is incredibly smart and learns from our knowledge base. It's like having a 24/7 support team without the overhead costs.",
                rating: 5,
                avatar: "MC"
              },
              {
                name: "Emily Rodriguez",
                role: "Founder, ShopLocal",
                content: "Setup took less than 10 minutes and we started capturing leads immediately. The analytics dashboard is phenomenal for tracking performance.",
                rating: 5,
                avatar: "ER"
              },
            ].map((testimonial, i) => (
              <div key={i} className="group bg-white dark:bg-zinc-800/30 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 hover:-translate-y-1">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <Star key={j} size={16} className="fill-yellow-500 text-yellow-500 dark:fill-yellow-400 dark:text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Stats */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {[
              { value: "4.9/5", label: "Average Rating" },
              { value: "10,000+", label: "Happy Customers" },
              { value: "500K+", label: "Conversations Handled" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-sm sm:text-base mb-4">
              <Rocket size={18} className="sm:w-5 sm:h-5" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Get Started in Minutes
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Create Your Chatbot",
                description: "Sign up and customize your chatbot's appearance, personality, and knowledge base.",
                icon: MessageSquare
              },
              {
                step: "02",
                title: "Add Integration",
                description: "Copy our simple embed code and paste it into your website. Works everywhere.",
                icon: Code
              },
              {
                step: "03",
                title: "Start Engaging",
                description: "Watch as your AI assistant handles customer queries and captures valuable leads.",
                icon: Rocket
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="group bg-white dark:bg-zinc-800/30 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 hover:-translate-y-1">
                  <div className="text-6xl font-bold text-purple-200 dark:text-purple-500/20 mb-4">{step.step}</div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <step.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-semibold mb-3 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-purple-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration / Works Everywhere Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-100/50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-500/10 border border-blue-300 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-sm sm:text-base mb-4">
              <Code size={18} className="sm:w-5 sm:h-5" />
              <span>Universal Integration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Works Everywhere
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              One simple embed code. Unlimited possibilities. Deploy on any platform in seconds.
            </p>
          </div>

          {/* Platform Icons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {[
              { name: "WordPress", icon: "W" },
              { name: "Shopify", icon: "S" },
              { name: "Webflow", icon: "Wf" },
              { name: "Wix", icon: "Wix" },
              { name: "React", icon: "⚛️" },
              { name: "HTML", icon: "</>" },
            ].map((platform, i) => (
              <div key={i} className="flex flex-col items-center gap-3 group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-zinc-800 dark:to-zinc-900 border border-gray-300 dark:border-zinc-700/50 flex items-center justify-center text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400 group-hover:border-purple-500 dark:group-hover:border-purple-500/50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all">
                  {platform.icon}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{platform.name}</span>
              </div>
            ))}
          </div>

          {/* Code Preview */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-900 dark:bg-zinc-900 border border-gray-800 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm sm:text-base font-semibold text-gray-400">embed.html</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <pre className="text-xs sm:text-sm text-purple-400 overflow-x-auto">
                <code>{`<script src="https://doodleai.com/widget.js"></script>\n<script>\n  DoodleAI.init({\n    botId: 'your-bot-id',\n    position: 'bottom-right'\n  });\n</script>`}</code>
              </pre>
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base mt-6">
              That's it! Just 5 lines of code to transform your website.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                Simple, Transparent Pricing
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              Choose the perfect plan for your business needs
            </p>

            {/* Monthly/Yearly Toggle */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              <span className={`text-base sm:text-lg font-medium transition-colors ${!isYearly ? 'text-purple-400' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-16 sm:w-20 h-8 sm:h-10 rounded-full transition-all ${
                  isYearly ? 'bg-purple-600' : 'bg-zinc-700'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 sm:w-8 h-6 sm:h-8 bg-white rounded-full shadow-lg transition-transform ${
                    isYearly ? 'translate-x-9 sm:translate-x-11' : 'translate-x-1'
                  }`}
                ></div>
              </button>
              <span className={`text-base sm:text-lg font-medium transition-colors ${isYearly ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-500'}`}>
                Yearly
                <span className="ml-2 text-xs sm:text-sm text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 px-2 py-1 rounded-full">
                  Save 8%
                </span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* 1 Chatbot Plan */}
            <div className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-zinc-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl sm:rounded-3xl"></div>
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Starter</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    ₹{isYearly ? '5,500' : '500'}
                  </span>
                  <span className="text-gray-400">/{isYearly ? 'year' : 'month'}</span>
                </div>
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">1 Chatbot</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">AI-Powered Responses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">Basic Analytics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">Email Support</span>
                  </div>
                </div>
                <button
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="w-full px-6 py-3 bg-zinc-800/50 hover:bg-zinc-700 text-white border border-zinc-700 rounded-xl font-semibold transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* 3 Chatbot Plan - Popular */}
            <div className="relative bg-purple-50 dark:bg-zinc-800 dark:bg-gradient-to-br dark:from-purple-900/50 dark:via-zinc-800 dark:to-zinc-900 border-2 border-purple-500 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:scale-105 transition-all shadow-xl shadow-purple-200 dark:shadow-purple-500/20">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-purple-500 rounded-full text-white text-xs sm:text-sm font-bold">
                MOST POPULAR
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl sm:rounded-3xl"></div>
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Growth</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    ₹{isYearly ? '12,000' : '1,200'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/{isYearly ? 'year' : 'month'}</span>
                </div>
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">3 Chatbots</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Advanced AI Features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Advanced Analytics</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Priority Support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Custom Branding</span>
                  </div>
                </div>
                <button
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* 5 Chatbot Plan */}
            <div className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-zinc-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-2xl sm:rounded-3xl"></div>
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Professional</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                    ₹{isYearly ? '20,000' : '2,000'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/{isYearly ? 'year' : 'month'}</span>
                </div>
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">5 Chatbots</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Premium AI Features</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Full Analytics Suite</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">24/7 Priority Support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">White Label Option</span>
                  </div>
                </div>
                <button
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="w-full px-6 py-3 bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 rounded-xl font-semibold transition-all"
                >
                  Get Started
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-gray-200 dark:border-zinc-700/50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-2xl sm:rounded-3xl"></div>
              <div className="relative">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Enterprise</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                    Custom
                  </span>
                </div>
                <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">5+ Chatbots</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Custom AI Training</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Dedicated Account Manager</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">SLA Guarantee</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle size={20} className="text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300">Custom Integration</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="w-full px-6 py-3 bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 rounded-xl font-semibold transition-all">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Security Badges */}
      <section className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 bg-gray-50 dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Enterprise-Grade Security & Compliance
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Your data is safe with industry-leading security standards</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 items-center justify-items-center">
            {[
              { name: "SSL Encrypted", icon: "🔒" },
              { name: "GDPR Compliant", icon: "✓" },
              { name: "SOC 2 Certified", icon: "🛡️" },
              { name: "ISO 27001", icon: "⭐" },
              { name: "99.9% Uptime", icon: "⚡" },
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-4 bg-white dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-zinc-700/50 hover:border-purple-400 dark:hover:border-purple-500/50 transition-all w-full">
                <div className="text-3xl sm:text-4xl">{badge.icon}</div>
                <div className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{badge.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-sm sm:text-base mb-4">
              <MessageSquare size={18} className="sm:w-5 sm:h-5" />
              <span>FAQ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {[
              {
                question: "How long does it take to set up?",
                answer: "You can have your first chatbot up and running in less than 10 minutes. Simply sign up, customize your bot, and copy our embed code to your website."
              },
              {
                question: "Do I need coding knowledge?",
                answer: "Not at all! Our platform is designed to be user-friendly with a visual interface. Just copy and paste a simple embed code into your website."
              },
              {
                question: "What AI model do you use?",
                answer: "We use advanced AI models that understand context and provide accurate responses. The AI learns from your knowledge base and gets smarter over time."
              },
              {
                question: "Can I customize the chatbot's appearance?",
                answer: "Yes! You have full control over colors, positioning, welcome messages, and branding. Make it match your website perfectly."
              },
              {
                question: "Is there a free trial?",
                answer: "Absolutely! Start with a free trial to test all features. No credit card required. You can upgrade anytime as your needs grow."
              },
              {
                question: "What kind of support do you offer?",
                answer: "We offer email support on all plans, priority support on Growth plan, and 24/7 dedicated support on Professional and Enterprise plans."
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-zinc-800/30 backdrop-blur-sm border border-gray-200 dark:border-zinc-700/50 hover:border-purple-400 dark:hover:border-purple-500/50 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10 hover:-translate-y-1">
                <summary className="px-6 sm:px-8 py-5 sm:py-6 cursor-pointer flex items-center justify-between font-semibold text-base sm:text-lg text-gray-900 dark:text-white list-none">
                  <span>{faq.question}</span>
                  <ChevronDown size={20} className="flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-6 sm:px-8 pb-5 sm:pb-6 text-sm sm:text-base text-gray-700 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-10 sm:mt-12 text-center">
            <p className="text-gray-400 mb-4">Still have questions?</p>
            <button 
              onClick={() => setShowContactModal(true)}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 rounded-xl font-semibold transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-white dark:bg-gradient-to-br dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border border-purple-300 dark:border-purple-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

            <div className="relative text-center space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-gray-900 via-purple-600 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent">
                  Ready to Transform Your Support?
                </span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
                Join thousands of businesses using Doodle AIs to engage customers and grow faster.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 pt-4">
                <button
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="px-7 sm:px-9 py-3.5 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 flex items-center justify-center gap-2 w-full sm:w-auto touch-manipulation"
                >
                  Start Your Free Trial
                  <ArrowRight size={20} className="sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={() => setShowContactModal(true)}
                  className="px-7 sm:px-9 py-3.5 sm:py-4 text-base sm:text-lg bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 rounded-xl font-semibold transition-all w-full sm:w-auto touch-manipulation">
                  Schedule a Demo
                </button>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 pt-6 sm:pt-8 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-xl mt-12 sm:mt-16 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image src={theme === 'light' ? LightLogo : Logo} alt="Doodle AI" className="h-8 sm:h-10 w-auto" />
                </Link>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                The most powerful Doodle AI platform for modern businesses.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Integration", "Documentation"]
              },
              {
                title: "Company",
links: ["About", "Blog", "Careers", "Contact"]
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Security", "GDPR"]
              },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base text-gray-900 dark:text-white">{col.title}</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 sm:pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
              © 2026 Doodle AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
                <a key={i} href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-xs sm:text-sm transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Live Demo Chat Widget */}


      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isLogin={isLogin}
          setIsLogin={setIsLogin}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} />
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}

// Reusable OTP input grid
function OtpGrid({ otp, setOtp, refs }) {
  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };
  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(next);
    refs[Math.min(pasted.length, 5)].current?.focus();
  };
  return (
    <div className="flex justify-center gap-2 sm:gap-3 mb-6">
      {otp.map((digit, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-lg sm:rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
        />
      ))}
    </div>
  );
}

// Auth Modal Component
function AuthModal({ isLogin, setIsLogin, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // "register-otp" | "forgot-email" | "forgot-otp" | "forgot-password" | null
  const [step, setStep] = useState(null);
  const [pendingEmail, setPendingEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resetDone, setResetDone] = useState(false);

  const otpRefs = Array.from({ length: 6 }, () => ({ current: null }));

  const startCooldown = () => {
    setResendCooldown(60);
    const t = setInterval(() => setResendCooldown((p) => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
  };

  const resetOtp = () => setOtp(["", "", "", "", "", ""]);

  // ── Register ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const api = (await import("@lib/api")).default;
      if (isLogin) {
        const { data } = await api.post("/auth/login", form);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        const { data } = await api.post("/auth/register", form);
        if (data.token) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/dashboard");
        } else {
          setPendingEmail(form.email);
          setStep("register-otp");
          startCooldown();
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegister = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit code."); return; }
    setError(""); setLoading(true);
    try {
      const api = (await import("@lib/api")).default;
      const { data } = await api.post("/auth/verify-otp", { email: pendingEmail, otp: code });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
      resetOtp(); otpRefs[0].current?.focus();
    } finally { setLoading(false); }
  };

  const handleResendRegister = async () => {
    if (resendCooldown > 0) return;
    setResending(true); setError("");
    try {
      const api = (await import("@lib/api")).default;
      await api.post("/auth/resend-otp", { email: pendingEmail });
      startCooldown();
    } catch (err) { setError(err.response?.data?.error || "Failed to resend"); }
    finally { setResending(false); }
  };

  // ── Forgot password ───────────────────────────────────────────────
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const api = (await import("@lib/api")).default;
      await api.post("/auth/forgot-password", { email: pendingEmail });
      setStep("forgot-otp");
      startCooldown();
    } catch (err) { setError(err.response?.data?.error || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleVerifyReset = async () => {
    const code = otp.join("");
    if (code.length < 6) { setError("Enter the complete 6-digit code."); return; }
    setError(""); setLoading(true);
    try {
      // Just validate OTP exists — actual reset happens on next step
      // We'll store the code and move on; server validates on submit
      setStep("forgot-newpass");
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      const api = (await import("@lib/api")).default;
      await api.post("/auth/reset-password", { email: pendingEmail, otp: otp.join(""), newPassword });
      setResetDone(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password");
      if (err.response?.data?.error?.includes("OTP")) { setStep("forgot-otp"); resetOtp(); }
    } finally { setLoading(false); }
  };

  const handleResendReset = async () => {
    if (resendCooldown > 0) return;
    setResending(true); setError("");
    try {
      const api = (await import("@lib/api")).default;
      await api.post("/auth/forgot-password", { email: pendingEmail });
      startCooldown();
    } catch (err) { setError(err.response?.data?.error || "Failed to resend"); }
    finally { setResending(false); }
  };

  const emailIcon = (
    <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    </div>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">{msg}</div>
  ) : null;

  const ResendRow = ({ onResend }) => (
    <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
      Didn&apos;t receive it?{" "}
      <button onClick={onResend} disabled={resendCooldown > 0 || resending}
        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 font-medium transition-colors">
        {resending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 touch-manipulation">✕</button>

        {/* ── Register OTP ── */}
        {step === "register-otp" && (
          <div>
            <div className="text-center mb-6">{emailIcon}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">We sent a 6-digit code to<br /><span className="text-purple-600 dark:text-purple-400 font-medium">{pendingEmail}</span></p>
            </div>
            <ErrorBox msg={error} />
            <OtpGrid otp={otp} setOtp={setOtp} refs={otpRefs} />
            <button onClick={handleVerifyRegister} disabled={loading || otp.join("").length < 6}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
              {loading ? "Verifying…" : "Verify Email"}
            </button>
            <ResendRow onResend={handleResendRegister} />
            <div className="text-center mt-3">
              <button onClick={() => { setStep(null); resetOtp(); setError(""); }} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">← Back to sign up</button>
            </div>
          </div>
        )}

        {/* ── Forgot: enter email ── */}
        {step === "forgot-email" && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Enter your email and we&apos;ll send a reset code.</p>
            </div>
            <ErrorBox msg={error} />
            <form onSubmit={handleForgotEmail} className="space-y-4">
              <input type="email" placeholder="Email Address" value={pendingEmail}
                onChange={(e) => setPendingEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required autoFocus />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
                {loading ? "Sending…" : "Send Reset Code"}
              </button>
            </form>
            <div className="text-center mt-4">
              <button onClick={() => { setStep(null); setError(""); setPendingEmail(""); }} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">← Back to login</button>
            </div>
          </div>
        )}

        {/* ── Forgot: enter OTP ── */}
        {step === "forgot-otp" && (
          <div>
            <div className="text-center mb-6">{emailIcon}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Enter Reset Code</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">We sent a 6-digit code to<br /><span className="text-purple-600 dark:text-purple-400 font-medium">{pendingEmail}</span></p>
            </div>
            <ErrorBox msg={error} />
            <OtpGrid otp={otp} setOtp={setOtp} refs={otpRefs} />
            <button onClick={handleVerifyReset} disabled={loading || otp.join("").length < 6}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
              {loading ? "Verifying…" : "Continue"}
            </button>
            <ResendRow onResend={handleResendReset} />
            <div className="text-center mt-3">
              <button onClick={() => { setStep("forgot-email"); resetOtp(); setError(""); }} className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">← Change email</button>
            </div>
          </div>
        )}

        {/* ── Forgot: new password ── */}
        {step === "forgot-newpass" && !resetDone && (
          <div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Set New Password</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">Choose a strong password for your account.</p>
            </div>
            <ErrorBox msg={error} />
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="password" placeholder="New Password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} minLength={6}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required autoFocus />
              <input type="password" placeholder="Confirm New Password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
                {loading ? "Saving…" : "Reset Password"}
              </button>
            </form>
          </div>
        )}

        {/* ── Reset success ── */}
        {step === "forgot-newpass" && resetDone && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Reset!</h2>
            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-6">Your password has been updated successfully.</p>
            <button onClick={() => { setStep(null); setIsLogin(true); setResetDone(false); resetOtp(); setNewPassword(""); setConfirmPassword(""); setError(""); }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
              Back to Login
            </button>
          </div>
        )}

        {/* ── Login / Register ── */}
        {!step && (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">{isLogin ? "Login to your dashboard" : "Start your free trial today"}</p>
            </div>
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-800/50 rounded-xl mb-6">
              <button type="button" onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${isLogin ? "bg-purple-600 text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Login</button>
              <button type="button" onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${!isLogin ? "bg-purple-600 text-white" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"}`}>Sign Up</button>
            </div>
            <ErrorBox msg={error} />
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input type="text" placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
              )}
              <input type="email" placeholder="Email Address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
              <input type="password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-zinc-800/50 border border-gray-300 dark:border-zinc-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
              {isLogin && (
                <div className="text-right">
                  <button type="button" onClick={() => { setStep("forgot-email"); setPendingEmail(form.email); setError(""); }}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
                {loading ? "Please wait…" : isLogin ? "Login" : "Continue"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Contact Modal Component
function ContactModal({ onClose }) {
  const contactNumber = "+91 8128305710";
  
  const handleCall = () => {
    window.location.href = `tel:${contactNumber}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contactNumber);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 text-2xl touch-manipulation">✕</button>
        
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Contact Us
          </h2>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-6">
            Have questions? We're here to help!
          </p>

          {/* Phone Number */}
          <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 rounded-xl p-4 sm:p-6 mb-6">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">Call us at</p>
            <a href={`tel:${contactNumber}`} className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              {contactNumber}
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCall}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Call Now
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-zinc-800/50 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-900 dark:text-white border border-gray-300 dark:border-zinc-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              Copy Number
            </button>
          </div>

          {/* Additional Info */}
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-6">
            Available Monday - Friday, 9 AM - 6 PM IST
          </p>
        </div>
      </div>
    </div>
  );
}

