"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, Zap, BarChart3, Globe, ArrowRight, CheckCircle, 
  Sparkles, Users, TrendingUp, Code, Rocket, Star, ChevronDown
} from "lucide-react";
import BotWidget, { SvgIcon as BotIcon } from "@components/BotWidget";

export default function HomePage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-zinc-800/50 backdrop-blur-xl bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <MessageSquare size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              AI ChatBot
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
              className="px-5 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg text-white text-sm font-medium transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm">
                <Sparkles size={16} />
                <span>Powered by Advanced AI</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Customer Support
                </span>
              </h1>
              
              <p className="text-xl text-gray-400 leading-relaxed max-w-xl">
                Deploy intelligent AI chatbots in minutes. Engage visitors, capture leads, 
                and provide 24/7 support with our powerful chatbot platform.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-xl text-white font-semibold transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-white font-semibold transition-all flex items-center gap-2"
                >
                  See How It Works
                  <ChevronDown size={20} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-800">
                {[
                  { value: "10k+", label: "Active Users" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "500k+", label: "Conversations" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-slide-up">
              <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl rounded-3xl border border-zinc-700/50 p-8 shadow-2xl">
                {/* Mock Chat Interface */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-zinc-700">
                    <BotIcon size={44} />
                    <div>
                      <div className="font-semibold">Support Assistant</div>
                      <div className="text-xs text-gray-400 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        Online
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <BotIcon size={36} className="flex-shrink-0" />
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-200">
                        Hello! How can I help you today?
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <div className="bg-zinc-700/50 rounded-2xl rounded-tr-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-200">
                        I need help with pricing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <BotIcon size={36} className="flex-shrink-0" />
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <p className="text-sm text-gray-200">
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
      <section id="features" className="relative z-10 py-20 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm mb-4">
              <Star size={16} />
              <span>Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features to enhance customer engagement and streamline support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="group bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 hover:border-purple-500/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} className={`text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-4">
              <Rocket size={16} />
              <span>Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Get Started in Minutes
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-8">
                  <div className="text-6xl font-bold text-purple-500/20 mb-4">{step.step}</div>
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <step.icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-gradient-to-r from-purple-500 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-purple-500/20 rounded-3xl p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative text-center space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Ready to Transform Your Support?
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Join thousands of businesses using AI chatbots to engage customers and grow faster.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <button 
                  onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-xl font-semibold transition-all shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2"
                >
                  Start Your Free Trial
                  <ArrowRight size={20} />
                </button>
                <button className="px-8 py-4 bg-zinc-800/50 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl font-semibold transition-all">
                  Schedule a Demo
                </button>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-6 pt-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-purple-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-purple-400" />
                  <span>14-day free trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-purple-400" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center">
                  <MessageSquare size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg">AI ChatBot</span>
              </div>
              <p className="text-gray-400 text-sm">
                The most powerful AI chatbot platform for modern businesses.
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
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 AI ChatBot. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          isLogin={isLogin} 
          setIsLogin={setIsLogin}
          onClose={() => setShowAuthModal(false)} 
        />
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

// Auth Modal Component
function AuthModal({ isLogin, setIsLogin, onClose }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const api = (await import("@lib/api")).default;
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Login to your dashboard" : "Start your free trial today"}
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
              isLogin ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${
              !isLogin ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              required
            />
          )}
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30"
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Create Account")}
          </button>
        </form>
      </div>
    </div>
  );
}
