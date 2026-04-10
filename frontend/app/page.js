"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  MessageSquare, Zap, BarChart3, Globe, ArrowRight, CheckCircle, 
  Sparkles, Users, TrendingUp, Code, Rocket, Star, ChevronDown, LogIn, UserPlus
} from "lucide-react";
import BotWidget, { SvgIcon as BotIcon } from "@components/BotWidget";
import Logo from "@images/logo.svg";
import Link from "next/link";
import Image from "next/image";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <Image src={Logo} alt="Doodle AI" className="h-9 sm:h-10 md:h-12 w-auto" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <button 
              onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all flex items-center justify-center gap-2 touch-manipulation"
              title="Login"
            >
              <LogIn size={20} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm font-medium">Login</span>
            </button>
            <button 
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="w-8 h-8 sm:w-auto sm:h-auto sm:px-5 md:px-6 sm:py-2.5 border border-purple-500 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all flex items-center justify-center gap-2 touch-manipulation"
              title="Get Started"
            >
              <UserPlus size={20} className="sm:w-5 sm:h-5" />
              <span className="hidden md:inline text-sm font-medium">Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-16 md:pt-20 pb-16 sm:pb-24 md:pb-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm sm:text-base">
                <Sparkles size={18} className="sm:w-5 sm:h-5" />
                <span>Powered by Advanced AI</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-white to-zinc-400 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Customer Support
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 leading-relaxed max-w-xl">
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
                  className="px-5 sm:px-9 py-3 sm:py-4 !text-sm sm:text-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-white font-semibold transition-all flex items-center justify-center gap-2 touch-manipulation"
                >
                  See How It Works
                  <ChevronDown size={20} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-zinc-800">
                {[
                  { value: "10k+", label: "Active Users" },
                  { value: "99.9%", label: "Uptime" },
                  { value: "500k+", label: "Conversations" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm sm:text-base text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative animate-slide-up hidden lg:block">
              <div className="relative bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-zinc-700/50 p-6 sm:p-8 shadow-2xl">
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
      <section id="features" className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm sm:text-base mb-4">
              <Star size={18} className="sm:w-5 sm:h-5" />
              <span>Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Everything You Need
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto px-4">
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
                className="group bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 hover:border-purple-500/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-xl bg-${feature.color}-500/10 border border-${feature.color}-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} className={`text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-base sm:text-lg text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm sm:text-base mb-4">
              <Rocket size={18} className="sm:w-5 sm:h-5" />
              <span>Simple Process</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
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
                <div className="bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 backdrop-blur-sm border border-zinc-700/50 rounded-xl sm:rounded-2xl p-6 sm:p-8">
                  <div className="text-6xl font-bold text-purple-500/20 mb-4">{step.step}</div>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30">
                    <step.icon size={32} className="text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-base sm:text-lg text-gray-400 leading-relaxed">{step.description}</p>
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
      <section className="relative z-10 py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border border-purple-500/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative text-center space-y-4 sm:space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Ready to Transform Your Support?
                </span>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto px-4">
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
                <button className="px-7 sm:px-9 py-3.5 sm:py-4 text-base sm:text-lg bg-zinc-800/50 hover:bg-zinc-800 text-white border border-zinc-700 rounded-xl font-semibold transition-all w-full sm:w-auto touch-manipulation">
                  Schedule a Demo
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 sm:gap-6 pt-6 sm:pt-8 text-sm sm:text-base text-gray-400">
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
      <footer className="relative z-10 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-xl mt-12 sm:mt-16 md:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/" className="flex items-center gap-2">
                  <Image src={Logo} alt="Doodle AI" className="h-8 sm:h-10 w-auto" />
                </Link>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm">
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
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">{col.title}</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-6 sm:pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-xs sm:text-sm">
              © 2026 Doodle AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6">
              {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
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
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold bg-zinc-800/50 border border-zinc-700 rounded-lg sm:rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
        await api.post("/auth/register", form);
        setPendingEmail(form.email);
        setStep("register-otp");
        startCooldown();
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
    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">{msg}</div>
  ) : null;

  const ResendRow = ({ onResend }) => (
    <div className="text-center text-sm text-gray-400 mt-4">
      Didn&apos;t receive it?{" "}
      <button onClick={onResend} disabled={resendCooldown > 0 || resending}
        className="text-purple-400 hover:text-purple-300 disabled:opacity-50 font-medium transition-colors">
        {resending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-white transition-colors p-2 touch-manipulation">✕</button>

        {/* ── Register OTP ── */}
        {step === "register-otp" && (
          <div>
            <div className="text-center mb-6">{emailIcon}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Check your email</h2>
              <p className="text-gray-400 text-xs sm:text-sm">We sent a 6-digit code to<br /><span className="text-purple-400 font-medium">{pendingEmail}</span></p>
            </div>
            <ErrorBox msg={error} />
            <OtpGrid otp={otp} setOtp={setOtp} refs={otpRefs} />
            <button onClick={handleVerifyRegister} disabled={loading || otp.join("").length < 6}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
              {loading ? "Verifying…" : "Verify Email"}
            </button>
            <ResendRow onResend={handleResendRegister} />
            <div className="text-center mt-3">
              <button onClick={() => { setStep(null); resetOtp(); setError(""); }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to sign up</button>
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
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Forgot Password?</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Enter your email and we&apos;ll send a reset code.</p>
            </div>
            <ErrorBox msg={error} />
            <form onSubmit={handleForgotEmail} className="space-y-4">
              <input type="email" placeholder="Email Address" value={pendingEmail}
                onChange={(e) => setPendingEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required autoFocus />
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
                {loading ? "Sending…" : "Send Reset Code"}
              </button>
            </form>
            <div className="text-center mt-4">
              <button onClick={() => { setStep(null); setError(""); setPendingEmail(""); }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to login</button>
            </div>
          </div>
        )}

        {/* ── Forgot: enter OTP ── */}
        {step === "forgot-otp" && (
          <div>
            <div className="text-center mb-6">{emailIcon}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Enter Reset Code</h2>
              <p className="text-gray-400 text-xs sm:text-sm">We sent a 6-digit code to<br /><span className="text-purple-400 font-medium">{pendingEmail}</span></p>
            </div>
            <ErrorBox msg={error} />
            <OtpGrid otp={otp} setOtp={setOtp} refs={otpRefs} />
            <button onClick={handleVerifyReset} disabled={loading || otp.join("").length < 6}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 rounded-xl text-white font-semibold transition-all shadow-lg shadow-purple-500/30">
              {loading ? "Verifying…" : "Continue"}
            </button>
            <ResendRow onResend={handleResendReset} />
            <div className="text-center mt-3">
              <button onClick={() => { setStep("forgot-email"); resetOtp(); setError(""); }} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Change email</button>
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
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Set New Password</h2>
              <p className="text-gray-400 text-xs sm:text-sm">Choose a strong password for your account.</p>
            </div>
            <ErrorBox msg={error} />
            <form onSubmit={handleResetPassword} className="space-y-4">
              <input type="password" placeholder="New Password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} minLength={6}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required autoFocus />
              <input type="password" placeholder="Confirm New Password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
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
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Password Reset!</h2>
            <p className="text-gray-400 text-xs sm:text-sm mb-6">Your password has been updated successfully.</p>
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
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-gray-400 text-xs sm:text-sm">{isLogin ? "Login to your dashboard" : "Start your free trial today"}</p>
            </div>
            <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-xl mb-6">
              <button type="button" onClick={() => { setIsLogin(true); setError(""); }}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${isLogin ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Login</button>
              <button type="button" onClick={() => { setIsLogin(false); setError(""); }}
                className={`flex-1 py-2 rounded-lg font-medium text-sm transition-all ${!isLogin ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"}`}>Sign Up</button>
            </div>
            <ErrorBox msg={error} />
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <input type="text" placeholder="Full Name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
              )}
              <input type="email" placeholder="Email Address" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
              <input type="password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" required />
              {isLogin && (
                <div className="text-right">
                  <button type="button" onClick={() => { setStep("forgot-email"); setPendingEmail(form.email); setError(""); }}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
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
