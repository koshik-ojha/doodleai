"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { MessageSquare, Users, FileText, TrendingUp, Plus, Settings as SettingsIcon } from "lucide-react";
import api from "@lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    Promise.all([
      api.get("/dashboard/stats"),
      api.get("/analytics?range=7days"),
    ])
      .then(([{ data: statsData }, { data: analyticsData }]) => {
        setStats(statsData);
        setAnalytics(analyticsData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      icon: MessageSquare,
      label: "TOTAL CHATS",
      value: stats?.totalChats ?? "—",
    },
    {
      icon: MessageSquare,
      label: "TOTAL CHATBOTS",
      value: stats?.totalChatbots ?? "—",
    },
    {
      icon: FileText,
      label: "FORM SUBMISSIONS",
      value: stats?.formSubmissions ?? "—",
    },
    {
      icon: TrendingUp,
      label: "RESPONSE RATE",
      value: stats?.responseRate ?? "—",
    },
  ];

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const usageData = analytics?.dailyActivity ?? [];
  const maxConversations = Math.max(...usageData.map((d) => d.conversations), 1);

  const topChats = analytics?.topChats ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard/analytics")}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <TrendingUp size={16} />
              View Reports
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-[#010009] border border-gray-200 dark:border-zinc-800/50 rounded-2xl p-6 animate-pulse h-40" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 hover:border-purple-400/40 dark:hover:border-purple-500/20 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-xs font-semibold tracking-wider">{stat.label}</span>
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-all">
                      <stat.icon size={20} className="text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Usage Trends and Top Conversations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Usage Trends Chart */}
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usage Trends</h2>
                <p className="text-gray-600 dark:text-gray-500 text-xs mt-1">Daily chats — last 7 days</p>
              </div>
            </div>
            {loading ? (
              <div className="h-64 flex items-end justify-around gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <div key={i} className="flex-1 h-full bg-purple-100 dark:bg-purple-500/5 rounded-t-lg animate-pulse" />
                ))}
              </div>
            ) : usageData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-600 dark:text-gray-500 text-sm">No data yet</div>
            ) : (
              <div className="h-64 flex items-end justify-around gap-2">
                {usageData.map((item) => {
                  const heightPct = Math.max(
                    (item.conversations / maxConversations) * 100,
                    4
                  );
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.conversations}
                      </span>
                      <div
                        className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg hover:from-purple-500 hover:to-purple-300 transition-colors cursor-pointer"
                        style={{ height: `${heightPct}%` }}
                        title={`${item.conversations} chats`}
                      />
                      <span className="text-xs text-gray-600 dark:text-gray-500 font-medium truncate max-w-full px-1">
                        {item.day.length > 6 ? item.day.substring(0, 3) : item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Conversations */}
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Conversations</h2>
                <p className="text-gray-600 dark:text-gray-500 text-xs mt-1">Most recent chat topics</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-purple-100 dark:bg-purple-500/5 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topChats.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-600 dark:text-gray-500 text-sm">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-4">
                {topChats.slice(0, 5).map((item, index) => {
                  const maxCount = Math.max(...topChats.map((t) => t.count), 1);
                  const pct = Math.max((item.count / maxCount) * 100, 10);
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                            <MessageSquare size={16} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[180px]">{item.question}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white shrink-0">{item.count}</p>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-gray-800/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/20 transition-colors">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <p className="text-gray-600 dark:text-gray-500 text-xs mt-1">Latest system events</p>
            </div>
            {loading ? (
              <div className="space-y-4 max-h-[320px] overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : stats?.recentActivity?.length > 0 ? (
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2">
                {stats.recentActivity.map((item, i) => {
                  const icons = [MessageSquare, Users, FileText];
                  const colors = [
                    "bg-blue-500/20 border-blue-500/30 text-blue-400",
                    "bg-purple-500/20 border-purple-500/30 text-purple-400",
                    "bg-green-500/20 border-green-500/30 text-green-400",
                  ];
                  const Icon = icons[i % 3];
                  return (
                    <div key={item._id} className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${colors[i % 3]} flex items-center justify-center border flex-shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{item.content}</p>
                        <p className="text-gray-600 dark:text-gray-500 text-xs mt-0.5">{item.chatTitle}</p>
                        <p className="text-gray-500 dark:text-gray-600 text-xs mt-0.5">{timeAgo(item.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-600 dark:text-gray-500 text-sm">
                No recent activity
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-purple-400/40 dark:hover:border-purple-500/20 transition-colors">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push("/dashboard/chat")}
                className="bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 border border-purple-300 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/30 rounded-xl p-6 transition-all group text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-purple-200 dark:bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-300 dark:group-hover:bg-purple-500/30 transition-colors">
                  <Plus size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">Start New Chat</p>
              </button>
              <button
                onClick={() => router.push("/dashboard/conversations")}
                className="bg-gray-100 dark:bg-gray-800/30 hover:bg-gray-200 dark:hover:bg-gray-800/50 border border-gray-300 dark:border-gray-700/30 hover:border-gray-400 dark:hover:border-gray-600/50 rounded-xl p-6 transition-all group text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-200 dark:bg-gray-700/30 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-700/50 transition-colors">
                  <MessageSquare size={24} className="text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">View Conversations</p>
              </button>
              <button
                onClick={() => router.push("/dashboard/analytics")}
                className="bg-gray-100 dark:bg-gray-800/30 hover:bg-gray-200 dark:hover:bg-gray-800/50 border border-gray-300 dark:border-gray-700/30 hover:border-gray-400 dark:hover:border-gray-600/50 rounded-xl p-6 transition-all group text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-200 dark:bg-gray-700/30 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-700/50 transition-colors">
                  <TrendingUp size={24} className="text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">View Analytics</p>
              </button>
              <button
                onClick={() => router.push("/dashboard/settings")}
                className="bg-gray-100 dark:bg-gray-800/30 hover:bg-gray-200 dark:hover:bg-gray-800/50 border border-gray-300 dark:border-gray-700/30 hover:border-gray-400 dark:hover:border-gray-600/50 rounded-xl p-6 transition-all group text-center"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gray-200 dark:bg-gray-700/30 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-700/50 transition-colors">
                  <SettingsIcon size={24} className="text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-gray-900 dark:text-white text-sm font-medium">Manage Settings</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

