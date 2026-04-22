"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Users,
  Code,
  Bot,
  ShieldBan,
  Mail,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@images/logo.svg";
import LightLogo from "@images/light-logo.svg";
import LogoIcon from "@images/logo-icon.svg";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@context/ThemeContext";
import api from "@lib/api";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isSuspended, setIsSuspended] = useState(false);
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load user data and check suspension status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserData(parsed);
        if (parsed.isSuspended) {
          setIsTrialExpired(!!parsed.trialExpired);
          setIsSuspended(true);
          return;
        }
      } catch {}
    }

    // Only fetch fresh profile once per browser session to check suspension
    // (subsequent checks happen via the api interceptor event on any API call)
    if (!sessionStorage.getItem("profileChecked")) {
      sessionStorage.setItem("profileChecked", "1");
      api.get("/auth/profile").then(({ data }) => {
        if (data.isSuspended) {
          const updated = { ...(JSON.parse(localStorage.getItem("user") || "{}")), isSuspended: true };
          localStorage.setItem("user", JSON.stringify(updated));
          setIsSuspended(true);
        }
      }).catch(() => {
        // suspension 403 is handled by the api interceptor event
      });
    }

    // Listen for suspension event dispatched by the api interceptor
    const onSuspended = (e) => {
      setIsTrialExpired(!!e?.detail?.trialExpired);
      setIsSuspended(true);
    };
    window.addEventListener("account-suspended", onSuspended);
    return () => window.removeEventListener("account-suspended", onSuspended);
  }, []);

  // While suspended: poll every 10 s so the modal clears as soon as admin reactivates
  useEffect(() => {
    if (!isSuspended) return;
    const interval = setInterval(() => {
      api.get("/auth/profile")
        .then(({ data }) => {
          if (!data.isSuspended) {
            // Reactivated — clear flag and dismiss modal
            try {
              const stored = JSON.parse(localStorage.getItem("user") || "{}");
              delete stored.isSuspended;
              localStorage.setItem("user", JSON.stringify(stored));
            } catch {}
            sessionStorage.removeItem("profileChecked");
            setIsSuspended(false);
          }
        })
        .catch(() => {
          // Still suspended — 403 handled silently by api interceptor
        });
    }, 10000);
    return () => clearInterval(interval);
  }, [isSuspended]);

  const isAdmin = userData?.role === "admin";

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
    { name: "Chatbots", icon: Bot, href: "/dashboard/chatbots" },
    { name: "Conversations", icon: MessagesSquare, href: "/dashboard/conversations" },
    { name: "Form Submissions", icon: FileText, href: "/dashboard/submissions" },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    ...(isAdmin ? [{ name: "Users", icon: Users, href: "/dashboard/admin" }] : []),
    ...(!isAdmin ? [{ name: "Integration", icon: Code, href: "/dashboard/integration" }] : []),
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.name) return "U";
    const names = userData.name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return userData.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#010009] overflow-hidden">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        flex flex-col bg-white dark:bg-[#010009] border-r border-gray-200 dark:border-gray-800/30 transition-all duration-300
        ${isMobile
          ? `fixed inset-y-0 left-0 z-50 w-72 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
          : `relative ${sidebarOpen ? 'w-64' : 'w-20'}`
        }
      `}>
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between">
          {(sidebarOpen || isMobile) ? (
            <>
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center">
                  <Image src={theme === 'light' ? LightLogo : Logo} alt="Logo" />
                </Link>
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
              >
                <Menu size={20} />
              </button>
              <Link href="/dashboard" className="flex items-center">
                <Image src={LogoIcon} alt="Logo" className="h-8 w-auto" />
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {(sidebarOpen || isMobile) && (
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-gray-100 dark:bg-[#0f0f0f] text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg pl-10 pr-16 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-600/50 border border-gray-300 dark:border-gray-800/50"
              />
              <svg className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="hidden sm:inline-block absolute right-3 top-2.5 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-500 bg-gray-200 dark:bg-[#0a0a0a] rounded border border-gray-300 dark:border-gray-800/50">⌘ F</kbd>
            </div>
          </div>
        )}

        {/* Main Menu Label */}
        {(sidebarOpen || isMobile) && (
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider">Main Menu</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all touch-manipulation ${
                  isActive
                    ? "bg-violet-100 dark:bg-[linear-gradient(180deg,_#23272C_0%,_#111417_100%)] text-violet-900 dark:text-white" 
                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[linear-gradient(180deg,_#23272C_0%,_#111417_100%)] hover:text-gray-900 dark:hover:text-white"
                } ${!sidebarOpen && !isMobile ? 'justify-center' : ''}`}
                title={!sidebarOpen && !isMobile ? item.name : ''}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
       

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800/30">
          {(sidebarOpen || isMobile) ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <ThemeToggle className="flex-1" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                  {getUserInitials()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {userData?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 truncate">
                    {userData?.email || "user@example.com"}
                  </p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-600 dark:text-gray-400 flex-shrink-0 touch-manipulation"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <ThemeToggle className="w-full" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors touch-manipulation"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Suspended / Trial Expired Modal — uncloseable fullscreen overlay */}
      {isSuspended && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md mx-4 bg-white dark:bg-[#0f0f1a] border border-red-500/30 rounded-2xl shadow-2xl shadow-red-900/20 p-8 flex flex-col items-center text-center">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <ShieldBan size={36} className="text-red-500" />
            </div>

            {isTrialExpired ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Free Trial Expired
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                  Your free trial of <span className="font-semibold text-red-400">14 days</span> has expired.
                  Your account and chatbots have been suspended. Please contact the admin to reactivate your account.
                </p>
                <div className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-left space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Contact Admin</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <Mail size={14} className="text-red-400 flex-shrink-0" />
                    <a href="mailto:wedoodlesinfotech@gmail.com" className="hover:text-red-400 transition-colors break-all">
                      wedoodlesinfotech@gmail.com
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-red-400 flex-shrink-0 text-xs">📞</span>
                    <a href="tel:+918128305710" className="hover:text-red-400 transition-colors">
                      +91 8128305710
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Account Suspended
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2">
                  Your account has been suspended by an administrator.
                  You cannot access the dashboard until your account is reactivated.
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mb-8">
                  If you believe this is a mistake, please reach out to our support team.
                </p>
              </>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 w-full">
              {!isTrialExpired && (
                <a
                  href="mailto:wedoodlesinfotech@gmail.com"
                  className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors text-sm"
                >
                  <Mail size={16} />
                  Contact Support
                </a>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors text-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        {isMobile && (
          <header className="bg-white dark:bg-[#010009] border-b border-gray-200 dark:border-gray-800/30 px-4 py-3 flex items-center justify-between lg:hidden sticky top-0 z-30">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg transition-colors text-gray-600 dark:text-gray-400 touch-manipulation"
            >
              <Menu size={24} />
            </button>
            <Link href="/dashboard" className="flex items-center">
              <Image src={LogoIcon} alt="Logo" className="h-8 w-auto" />
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {getUserInitials()}
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-[#010009] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

