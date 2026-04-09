"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { MoreVertical, Trash2, Eye } from "lucide-react";
import { ConfirmModal } from "@components/ui";
import api from "@lib/api";

export default function ConversationsPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenu, setOpenMenu] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    api.get("/chats")
      .then(({ data }) => setConversations(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await api.delete(`/chats/${confirmId}`);
      setConversations((prev) => prev.filter((c) => c._id !== confirmId));
    } catch (e) {
      console.error(e);
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

  // Group conversations by time period
  const isToday = (date) => {
    const today = new Date();
    const convDate = new Date(date);
    return today.toDateString() === convDate.toDateString();
  };

  const isLast30Days = (date) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const convDate = new Date(date);
    return !isToday(date) && convDate > thirtyDaysAgo;
  };

  const todayConversations = conversations.filter(c => isToday(c.updatedAt));
  const last30DaysConversations = conversations.filter(c => isLast30Days(c.updatedAt));

  const ConversationItem = ({ conversation }) => {
    const firstMessage = conversation.messages?.[0]?.content || "No messages yet";
    const summary = firstMessage.length > 100 ? firstMessage.substring(0, 100) + "..." : firstMessage;

    return (
      <div className="group relative transition-colors rounded-lg cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div 
            className="flex-1 min-w-0"
            onClick={() => router.push(`/dashboard/chat?id=${conversation._id}`)}
          >
            <h3 className="text-white font-normal text-sm mb-1 truncate">
              {conversation.title}
            </h3>
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">
              {summary}
            </p>
            <p className="text-gray-600 text-xs mt-1">
              {timeAgo(conversation.updatedAt)}
            </p>
          </div>
          
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === conversation._id ? null : conversation._id);
              }}
              className="p-1 hover:bg-gray-800/50 rounded transition-colors"
            >
              <MoreVertical size={16} className="text-gray-400" />
            </button>
            
            {openMenu === conversation._id && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setOpenMenu(null)}
                />
                <div className="absolute right-0 top-8 z-20 bg-[#1a1a2e]/95 border border-purple-500/20 rounded-lg shadow-xl overflow-hidden min-w-[160px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/chat?id=${conversation._id}`);
                      setOpenMenu(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-purple-500/10 transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmId(conversation._id);
                      setOpenMenu(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Conversations</h1>
          <p className="text-gray-400 mt-1">View all chat conversations</p>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-xl px-4 py-3 animate-pulse">
                <div className="h-4 bg-purple-500/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-purple-500/5 rounded w-full mb-1" />
                <div className="h-3 bg-purple-500/5 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {todayConversations.length > 0 && (
              <div>
                <h2 className="text-white font-semibold text-lg mb-3">Today</h2>
                <div className="space-y-3">
                  {todayConversations.map((conv) => (
                    <div key={conv._id} className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-xl px-4 py-3 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
                      <ConversationItem conversation={conv} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {last30DaysConversations.length > 0 && (
              <div className="pt-4">
                <h2 className="text-white font-semibold text-lg mb-3">Last 30 days</h2>
                <div className="space-y-3">
                  {last30DaysConversations.map((conv) => (
                    <div key={conv._id} className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-xl px-4 py-3 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
                      <ConversationItem conversation={conv} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {conversations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">No conversations yet</p>
              </div>
            )}
          </>
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
