"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import {
  MessageCircle, Users, Zap, BarChart2, UserPlus,
  TrendingUp, TrendingDown, RefreshCw,
} from "lucide-react";
import { Select } from "@components/ui";
import api from "@lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const RANGE_OPTIONS = [
  { value: "24hours", label: "Last 24 hours" },
  { value: "weekly",  label: "Last 7 days"   },
  { value: "monthly", label: "Last 30 days"  },
  { value: "quarterly", label: "Last 90 days" },
];

const RANGE_API = {
  "24hours": "24hours",
  weekly:    "7days",
  monthly:   "30days",
  quarterly: "90days",
};

// Hours to display in the heatmap rows
const HEATMAP_HOURS = [6, 9, 12, 15, 18, 21];
// Day columns: 0=Mon … 6=Sun
const HEATMAP_DAYS  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Small helpers ─────────────────────────────────────────────────────────────
function TrendBadge({ value }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
        up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
      }`}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(value)}%
    </span>
  );
}

function heatmapColor(intensity) {
  return [
    "bg-gray-200 dark:bg-zinc-800/30",
    "bg-purple-200 dark:bg-purple-500/15",
    "bg-purple-300 dark:bg-purple-500/35",
    "bg-purple-400 dark:bg-purple-500/55",
    "bg-purple-500 dark:bg-purple-600/75",
    "bg-purple-600 dark:bg-purple-600",
  ][Math.min(intensity, 5)] ?? "bg-gray-200 dark:bg-zinc-800/30";
}

// Build intensity map from real hourlyActivity { dayIdx: { hour: count } }
function buildHeatmap(hourlyActivity = {}) {
  let maxCount = 1;
  Object.values(hourlyActivity).forEach((dayData) =>
    Object.values(dayData).forEach((c) => { if (c > maxCount) maxCount = c; })
  );

  const intensityMap = {};
  HEATMAP_DAYS.forEach((day, dayIdx) => {
    intensityMap[day] = HEATMAP_HOURS.map((hour) => {
      const count = hourlyActivity[dayIdx]?.[hour] ?? 0;
      return Math.min(5, Math.round((count / maxCount) * 5));
    });
  });

  return intensityMap;
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const router = useRouter();
  const [range, setRange]     = useState("weekly");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get(`/analytics?range=${RANGE_API[range]}`)
      .then(({ data: res }) => setData(res))
      .catch(() => {
        setError("Failed to load analytics. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [range]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetchData();
  }, [fetchData, router]);

  // ── Derived values ────────────────────────────────────────────────────────
  const metrics = data
    ? [
        {
          icon: MessageCircle,
          label: "Total Chats",
          value: data.totalChats.toLocaleString(),
          sub: `avg ${data.avgMessagesPerChat} msg / chat`,
          trend: data.trends?.chats,
        },
        {
          icon: BarChart2,
          label: "Messages Sent",
          value: data.totalMessages.toLocaleString(),
          sub: "user messages in period",
          trend: data.trends?.messages,
        },
        {
          icon: Zap,
          label: "AI Completion",
          value: data.aiCompletionRate,
          sub: "of prompts answered",
          trend: null,
        },
        data.isAdmin
          ? {
              icon: UserPlus,
              label: "New Users",
              value: data.newUsers.toLocaleString(),
              sub: `${data.uniqueUsers} total active`,
              trend: data.trends?.users,
            }
          : {
              icon: Users,
              label: "Unique Visitors",
              value: data.uniqueUsers.toLocaleString(),
              sub: `avg ${data.avgMessagesPerChat} msg / session`,
              trend: null,
            },
      ]
    : [];

  const intensityMap = buildHeatmap(data?.hourlyActivity ?? {});

  const barData  = data?.dailyActivity ?? [];
  const maxBar   = Math.max(...barData.map((d) => d.conversations), 1);
  const yTicks   = Array.from({ length: 5 }, (_, i) =>
    Math.round(maxBar - (i * maxBar) / 4)
  ).concat(0);

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
              Track chatbot performance · data updates on refresh
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              options={RANGE_OPTIONS}
              variant="dark"
              className="!bg-white dark:!bg-[#1a1a2e] !border-gray-300 dark:!border-purple-500/20 !rounded-xl hover:!border-purple-500/40"
            />

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Metric Cards + Heatmap ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* 2×2 metric cards */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {loading
              ? [1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 animate-pulse h-36" />
                ))
              : metrics.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-purple-500/25 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-all">
                          <Icon size={16} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <TrendBadge value={m.trend} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{m.value}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px] font-medium mt-0.5">{m.label}</p>
                      <p className="text-gray-500 dark:text-gray-600 text-[10px] mt-1">{m.sub}</p>
                    </div>
                  );
                })}
          </div>

          {/* Session heatmap */}
          <div className="lg:col-span-3 bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Session Heatmap</h2>
                <p className="text-gray-600 dark:text-gray-500 text-xs mt-0.5">
                  Real message activity by day &amp; hour
                </p>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-600 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-gray-200 dark:bg-zinc-800/50 inline-block" /> None
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-purple-300 dark:bg-purple-500/35 inline-block" /> Mid
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-purple-500 dark:bg-purple-600 inline-block" /> Peak
                </span>
              </div>
            </div>

            {loading ? (
              <div className="h-44 animate-pulse bg-gray-100 dark:bg-purple-500/5 rounded-xl" />
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[360px]">
                  {/* Day header */}
                  <div className="flex mb-1.5 ml-12">
                    {HEATMAP_DAYS.map((d) => (
                      <div key={d} className="flex-1 text-center">
                        <span className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">{d}</span>
                      </div>
                    ))}
                  </div>
                  {/* Hour rows */}
                  {HEATMAP_HOURS.map((hour, hIdx) => (
                    <div key={hour} className="flex items-center mb-1">
                      <div className="w-12 text-right pr-2">
                        <span className="text-[10px] text-gray-500 dark:text-gray-600">
                          {String(hour).padStart(2, "0")}:00
                        </span>
                      </div>
                      {HEATMAP_DAYS.map((day) => {
                        const intensity = intensityMap[day]?.[hIdx] ?? 0;
                        return (
                          <div key={day} className="flex-1 px-0.5">
                            <div
                              className={`w-full h-8 rounded-md ${heatmapColor(intensity)} transition-all hover:scale-105 hover:brightness-125 cursor-pointer`}
                              title={`${day} ${String(hour).padStart(2, "0")}:00 — intensity ${intensity}/5`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Daily Activity Bar Chart ── */}
        <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Activity</h2>
              <p className="text-gray-600 dark:text-gray-500 text-xs mt-0.5">New conversations started per day</p>
            </div>
            {data && (
              <p className="text-xs text-gray-600 dark:text-gray-500">
                Total:{" "}
                <span className="text-gray-900 dark:text-white font-semibold">
                  {data.totalChats.toLocaleString()}
                </span>{" "}
                chats
              </p>
            )}
          </div>

          {loading ? (
            <div className="h-56 animate-pulse bg-gray-100 dark:bg-purple-500/5 rounded-xl" />
          ) : barData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-500 dark:text-gray-600 text-sm">
              No activity in this period
            </div>
          ) : (
            <div className="relative h-56">
              {/* Y-axis */}
              <div className="absolute left-0 top-0 bottom-6 w-10 flex flex-col justify-between pointer-events-none">
                {yTicks.map((v, i) => (
                  <span key={i} className="text-[10px] text-gray-500 dark:text-gray-600 text-right pr-2 leading-none">
                    {v}
                  </span>
                ))}
              </div>

              {/* Grid lines */}
              <div className="absolute left-10 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                {yTicks.map((_, i) => (
                  <div key={i} className="border-t border-gray-200 dark:border-purple-500/10 w-full" />
                ))}
              </div>

              {/* Bars */}
              <div className="absolute left-10 right-0 top-0 bottom-6 flex items-end gap-1">
                {barData.map((item, idx) => {
                  const pct       = (item.conversations / maxBar) * 100;
                  const isPeak    = item.conversations === maxBar && item.conversations > 0;
                  const hasData   = item.conversations > 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center justify-end h-full group/bar"
                    >
                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-500 mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                        {item.conversations}
                      </span>
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isPeak
                            ? "bg-purple-500 hover:bg-purple-400 shadow-md shadow-purple-500/20"
                            : hasData
                            ? "bg-gray-400 dark:bg-zinc-700 hover:bg-gray-500 dark:hover:bg-zinc-600"
                            : "bg-gray-200 dark:bg-zinc-800/40"
                        }`}
                        style={{ height: `${hasData ? Math.max(pct, 2) : 1}%` }}
                        title={`${item.day}: ${item.conversations} chats`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="absolute left-10 right-0 bottom-0 h-6 flex items-center">
                {barData.map((item, idx) => (
                  <div key={idx} className="flex-1 text-center">
                    <span className="text-[10px] text-gray-500 dark:text-gray-600 font-medium">
                      {item.day.length > 6 ? item.day.substring(0, 3) : item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Most Active Conversations ── */}
        <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Most Active Conversations</h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-9 bg-gray-100 dark:bg-purple-500/5 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !data?.topChats?.length ? (
            <div className="py-10 text-center text-gray-500 dark:text-gray-600 text-sm">
              No conversations in this period
            </div>
          ) : (
            <div className="space-y-3">
              {data.topChats.map((item, i) => {
                const topCount = data.topChats[0]?.count ?? 1;
                const pct = Math.max((item.count / topCount) * 100, 4);
                return (
                  <div key={i} className="flex items-center gap-3 group">
                    <span className="text-gray-500 dark:text-gray-700 text-xs font-bold w-4 text-right flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="text-gray-700 dark:text-gray-300 text-xs truncate group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                          {item.question}
                        </p>
                        <span className="text-gray-600 dark:text-gray-500 text-[10px] ml-3 flex-shrink-0">
                          {item.count} msg{item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="h-1 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}

