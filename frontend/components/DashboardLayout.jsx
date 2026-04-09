"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
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
import LogoIcon from "@images/logo-icon.svg";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);

  // Load user data from localStorage
  useState(() => {
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

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Chat", icon: MessageSquare, href: "/dashboard/chat" },
    { name: "Chatbots", icon: Bot, href: "/dashboard/chatbots" },
    { name: "Conversations", icon: MessageSquare, href: "/dashboard/conversations" },
    { name: "Form Submissions", icon: FileText, href: "/dashboard/submissions" },
    { name: "Analytics", icon: BarChart3, href: "/dashboard/analytics" },
    { name: "Users", icon: Users, href: "/dashboard/users" },
    { name: "Integration", icon: Code, href: "/dashboard/integration" },
    { name: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

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
    <div className="flex h-screen bg-[#010009]">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 flex flex-col relative`}>
        {/* Logo & Toggle */}
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <Link href="/dashboard" className="flex items-center">
                  <Image src={Logo} alt="Logo" />
                </Link>
              </div>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400"
              >
                <X size={18} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400"
              >
                <Menu size={18} />
              </button>
              <Link href="/dashboard" className="flex items-center">
                <Image src={LogoIcon} alt="Logo" />
              </Link>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {sidebarOpen && (
          <div className="px-4 pb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-[#0f0f0f] text-gray-300 placeholder-gray-500 rounded-lg pl-10 pr-16 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-violet-600/50 border border-gray-800/50"
              />
              <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <kbd className="absolute right-3 top-2.5 px-2 py-0.5 text-xs text-gray-500 bg-[#0a0a0a] rounded border border-gray-800/50">⌘ F</kbd>
            </div>
          </div>
        )}

        {/* Main Menu Label */}
        {sidebarOpen && (
          <div className="px-4 pb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Main Menu</p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-[linear-gradient(180deg,_#23272C_0%,_#111417_100%)]  text-white" 
                    : "text-gray-400 hover:bg-[linear-gradient(180deg,_#23272C_0%,_#111417_100%)]  hover:text-white"
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>
       

        {/* User Profile */}
        <div className="p-4 border-t border-gray-800/30">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {userData?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userData?.email || "user@example.com"}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-gray-800/50 rounded-lg transition-colors text-gray-400 flex-shrink-0"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-800/50 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* <header className="bg-[#141414]/80 backdrop-blur-xl border-b border-gray-800/30 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-lg">
                U
              </div>
            </div>
          </div>
        </header> */}

        {/* Content */}
        <main className="flex-1 overflow-y-auto m-5 p-6 bg-[#0f0f0f] overflow-hidden relative rounded-3xl border border-gray-800/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(90,80,200,0.18),_transparent_35%)]"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 blur-3xl rounded-full"></div>
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
