"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { Plus, Settings, Trash2, Bot, CheckCircle, XCircle, Calendar, Loader2, AlertTriangle } from "lucide-react";
import { ConfirmModal } from "@components/ui";
import api from "@lib/api";
import showToast from "@utils/toast";
import Link from "next/link";

export default function ChatbotsPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subLimit, setSubLimit] = useState(null); // { limit, count, planKey }
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setIsAdmin(user.role === "admin");
      if (user.role !== "admin") {
        api.get("/subscriptions/me").then(({ data }) => {
          if (data) setSubLimit({ limit: data.chatbotLimit, planKey: data.planKey, billing: data.billing });
        }).catch(() => {});
      }
    } catch {}
    fetchPage(1, true);
  }, []);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get(`/chatbots?page=${pageNum}&limit=12`);
      setChatbots((prev) => reset ? data.chatbots : [...prev, ...data.chatbots]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch {
      // Errors (including suspension 403) are handled by the api interceptor
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPage(page + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPage]);

  const handleCreate = async () => {
    if (!newName.trim()) {
      showToast.warning("Please enter a chatbot name");
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post("/chatbots", { name: newName.trim(), botName: newName.trim() });
      setChatbots((prev) => [data, ...prev]);
      setNewName("");
      setShowCreate(false);
      showToast.success("Chatbot created successfully!");
      router.push(`/dashboard/integration?botId=${data._id}`);
    } catch {
      // Error toast is shown by the API interceptor in lib/api.js
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/chatbots/${confirmId}`);
      setChatbots((prev) => prev.filter((b) => b._id !== confirmId));
      showToast.success("Chatbot deleted successfully");
    } catch {
      // Error toast is shown by the API interceptor in lib/api.js
    } finally {
      setConfirmId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  // Group chatbots by user (admin view)
  const grouped = isAdmin
    ? Object.entries(
        chatbots.reduce((acc, bot) => {
          const uid = bot.userId?._id || "unknown";
          if (!acc[uid]) acc[uid] = { user: bot.userId, bots: [] };
          acc[uid].bots.push(bot);
          return acc;
        }, {})
      )
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chatbots</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isAdmin ? "All chatbots across all users" : "Manage your chatbot instances"}
            </p>
          </div>
          {!isAdmin && (() => {
            const atLimit = subLimit && chatbots.length >= subLimit.limit;
            return (
              <button
                onClick={() => atLimit ? router.push("/dashboard/billing") : setShowCreate(true)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium transition-all ${
                  atLimit
                    ? "bg-amber-100 dark:bg-amber-500/10 border border-amber-400 dark:border-amber-500/30 text-amber-700 dark:text-amber-400"
                    : "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white hover:shadow-lg hover:shadow-purple-500/20"
                }`}
              >
                {atLimit ? <><AlertTriangle size={18} /> Upgrade Plan</> : <><Plus size={18} /> New Chatbot</>}
              </button>
            );
          })()}
        </div>

        {/* Limit banner */}
        {!isAdmin && subLimit && chatbots.length >= subLimit.limit && (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
            <AlertTriangle size={16} className="flex-shrink-0" />
            <span>
              You&apos;ve reached the <strong>{subLimit.limit}-chatbot limit</strong> on your {subLimit.planKey} plan.{" "}
              <Link href="/dashboard/billing" className="underline font-medium hover:text-amber-600">Upgrade your plan</Link> to create more.
            </span>
          </div>
        )}

        {/* Create form */}
        {showCreate && !isAdmin && (
          <div className="bg-white dark:bg-[#1a1a2e]/60 border border-gray-200 dark:border-purple-500/20 rounded-2xl p-5 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1.5 block">Chatbot Name</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
                placeholder="e.g. E-commerce Support, Booking Bot..."
                className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-purple-500/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
            >
              {creating ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewName(""); }}
              className="px-4 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-200 dark:bg-purple-500/10 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-100 dark:bg-purple-500/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 dark:bg-purple-500/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-20 border border-gray-200 dark:border-purple-500/10 rounded-2xl bg-gray-50 dark:bg-[#1a1a2e]/30">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-lg mb-2">No chatbots yet</h3>
            <p className="text-gray-600 dark:text-gray-500 text-sm mb-6">Create your first chatbot to get started</p>
            {!isAdmin && (
              <button
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-all"
              >
                <Plus size={15} /> Create Chatbot
              </button>
            )}
          </div>
        ) : isAdmin ? (
          <div className="space-y-8">
            {grouped.map(([uid, { user, bots }]) => (
              <div key={uid}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">{user?.name || "Unknown"}</span>
                  <span className="text-gray-600 dark:text-gray-500 text-xs">({user?.email || "—"})</span>
                  <span className="ml-auto text-gray-500 dark:text-gray-600 text-xs">{bots.length} bot{bots.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bots.map((bot) => (
                    <BotCard key={bot._id} bot={bot} isAdmin formatDate={formatDate} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatbots.map((bot) => (
              <BotCard
                key={bot._id}
                bot={bot}
                isAdmin={false}
                formatDate={formatDate}
                onConfigure={() => router.push(`/dashboard/integration?botId=${bot._id}`)}
                onDelete={() => setConfirmId(bot._id)}
              />
            ))}
          </div>
        )}

        {/* Sentinel for infinite scroll */}
        <div ref={sentinelRef} className="h-4" />

        {/* Loading more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="text-purple-400 animate-spin" />
          </div>
        )}

        {/* End of list */}
        {!hasMore && chatbots.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-700 text-xs py-2">All chatbots loaded</p>
        )}
      </div>

      <ConfirmModal
        open={!!confirmId}
        title="Delete chatbot?"
        message="This will permanently delete the chatbot and all its configuration."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </DashboardLayout>
  );
}

function BotCard({ bot, isAdmin, formatDate, onConfigure, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-purple-500/25 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (bot.primaryColor || "#7c3aed") + "22" }}>
            <Bot size={20} style={{ color: bot.primaryColor || "#7c3aed" }} />
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{bot.name}</h3>
            <p className="text-gray-600 dark:text-gray-500 text-xs">{bot.botName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {bot.isActive ? (
            <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              <CheckCircle size={11} /> Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-500 bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-full">
              <XCircle size={11} /> Inactive
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
          <Calendar size={11} />
          Created {formatDate(bot.createdAt)}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: bot.primaryColor || "#7c3aed" }} />
          {bot.faqs?.length || 0} FAQ{bot.faqs?.length !== 1 ? "s" : ""} · {bot.knowledgeBase ? "Has knowledge base" : "No knowledge base"}
        </div>
      </div>

      {!isAdmin && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-purple-500/10">
          <button
            onClick={onConfigure}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-100 dark:bg-purple-500/10 hover:bg-purple-200 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 rounded-lg text-xs font-medium transition-all"
          >
            <Settings size={13} /> Configure
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

