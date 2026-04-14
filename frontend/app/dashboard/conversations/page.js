"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { MoreVertical, Trash2, Eye, Loader2, MessageSquare } from "lucide-react";
import { ConfirmModal } from "@components/ui";
import api from "@lib/api";

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setIsAdmin(user.role === "admin");
    } catch {}
    fetchPage(1, true);
  }, []);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get(`/chats?page=${pageNum}&limit=15`);
      setConversations((prev) => reset ? data.chats : [...prev, ...data.chats]);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch {
      // handled by api interceptor
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

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

  const handleDelete = async () => {
    try {
      await api.delete(`/chats/${confirmId}`);
      setConversations((prev) => prev.filter((c) => c._id !== confirmId));
    } catch {
      // handled by api interceptor
    } finally {
      setConfirmId(null);
      setOpenMenu(null);
    }
  };

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ── Regular user: group by time period ──
  const isToday = (date) => new Date().toDateString() === new Date(date).toDateString();
  const isLast30Days = (date) => {
    const ago = new Date(); ago.setDate(ago.getDate() - 30);
    return !isToday(date) && new Date(date) > ago;
  };

  // ── Admin: group by userId ──
  const grouped = isAdmin
    ? Object.entries(
        conversations.reduce((acc, conv) => {
          const uid = conv.userId?._id || "unknown";
          if (!acc[uid]) acc[uid] = { user: conv.userId, convs: [] };
          acc[uid].convs.push(conv);
          return acc;
        }, {})
      )
    : [];

  const todayConvs    = conversations.filter((c) => isToday(c.updatedAt));
  const last30Convs   = conversations.filter((c) => isLast30Days(c.updatedAt));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Conversations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin ? "All conversations across all users" : "View all chat conversations"}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-xl px-4 py-3 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-purple-500/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-purple-500/5 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 dark:bg-purple-500/5 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <MessageSquare size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
          </div>
        ) : isAdmin ? (
          // ── Admin grouped by user ──
          <div className="space-y-8">
            {grouped.map(([uid, { user, convs }]) => (
              <div key={uid}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">{user?.name || "Unknown"}</span>
                  <span className="text-gray-600 dark:text-gray-500 text-xs">({user?.email || "—"})</span>
                  <span className="ml-auto text-gray-500 dark:text-gray-600 text-xs">{convs.length} chat{convs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-2">
                  {convs.map((conv) => (
                    <ConvItem
                      key={conv._id}
                      conv={conv}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      setConfirmId={setConfirmId}
                      timeAgo={timeAgo}
                      onView={() => router.push(`/dashboard/chat?id=${conv._id}`)}
                      isAdmin
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ── Regular user grouped by time ──
          <>
            {todayConvs.length > 0 && (
              <div>
                <h2 className="text-gray-900 dark:text-white font-semibold text-lg mb-3">Today</h2>
                <div className="space-y-2">
                  {todayConvs.map((conv) => (
                    <ConvItem
                      key={conv._id}
                      conv={conv}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      setConfirmId={setConfirmId}
                      timeAgo={timeAgo}
                      onView={() => router.push(`/dashboard/chat?id=${conv._id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
            {last30Convs.length > 0 && (
              <div className="pt-2">
                <h2 className="text-gray-900 dark:text-white font-semibold text-lg mb-3">Last 30 days</h2>
                <div className="space-y-2">
                  {last30Convs.map((conv) => (
                    <ConvItem
                      key={conv._id}
                      conv={conv}
                      openMenu={openMenu}
                      setOpenMenu={setOpenMenu}
                      setConfirmId={setConfirmId}
                      timeAgo={timeAgo}
                      onView={() => router.push(`/dashboard/chat?id=${conv._id}`)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="text-purple-400 animate-spin" />
          </div>
        )}

        {!hasMore && conversations.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-700 text-xs py-2">All conversations loaded</p>
        )}
      </div>

      <ConfirmModal
        open={!!confirmId}
        title="Delete conversation?"
        message="This will permanently delete the conversation and all its messages."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </DashboardLayout>
  );
}

function ConvItem({ conv, openMenu, setOpenMenu, setConfirmId, timeAgo, onView, isAdmin }) {
  const firstMessage = conv.messages?.[0]?.content || "No messages yet";
  const summary = firstMessage.length > 100 ? firstMessage.substring(0, 100) + "..." : firstMessage;

  return (
    <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-xl px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 hover:border-gray-300 dark:hover:border-purple-500/20 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onView}>
          <h3 className="text-gray-900 dark:text-white font-normal text-sm mb-1 truncate">{conv.title}</h3>
          <p className="text-gray-600 dark:text-gray-500 text-xs leading-relaxed line-clamp-2">{summary}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-gray-500 dark:text-gray-600 text-xs">{timeAgo(conv.updatedAt)}</span>
            {conv.messageCount > 0 && (
              <span className="text-gray-500 dark:text-gray-700 text-xs">{conv.messageCount} msg{conv.messageCount !== 1 ? "s" : ""}</span>
            )}
          </div>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === conv._id ? null : conv._id); }}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded transition-colors"
          >
            <MoreVertical size={16} className="text-gray-500 dark:text-gray-400" />
          </button>

          {openMenu === conv._id && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-[#1a1a2e]/95 border border-gray-200 dark:border-purple-500/20 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                <button
                  onClick={(e) => { e.stopPropagation(); onView(); setOpenMenu(null); }}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                >
                  <Eye size={14} /> View
                </button>
                {!isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmId(conv._id); setOpenMenu(null); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

