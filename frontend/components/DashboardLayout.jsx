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
  Bot
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@images/logo.svg";
import LightLogo from "@images/light-logo.svg";
import LogoIcon from "@images/logo-icon.svg";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "@context/ThemeContext";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userData, setUserData] = useState(null);

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

  // Load user data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem("user");
      if (user) {
        try {
          setUserData(JSON.parse(user));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

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

