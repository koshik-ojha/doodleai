"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { Plus, Settings, Trash2, Bot, CheckCircle, XCircle, Calendar } from "lucide-react";
import { ConfirmModal } from "@components/ui";
import api from "@lib/api";

export default function ChatbotsPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetchChatbots();
  }, []);

  const fetchChatbots = () => {
    api.get("/chatbots")
      .then(({ data }) => setChatbots(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data } = await api.post("/chatbots", { name: newName.trim(), botName: newName.trim() });
      setChatbots((prev) => [data, ...prev]);
      setNewName("");
      setShowCreate(false);
      router.push(`/dashboard/integration?botId=${data._id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/chatbots/${confirmId}`);
      setChatbots((prev) => prev.filter((b) => b._id !== confirmId));
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Chatbots</h1>
            <p className="text-gray-400 mt-1">Manage your chatbot instances</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg px-5 py-2.5 text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
          >
            <Plus size={18} /> New Chatbot
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="bg-[#1a1a2e]/60 border border-purple-500/20 rounded-2xl p-5 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-sm text-gray-400 font-medium mb-1.5 block">Chatbot Name</label>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setShowCreate(false); }}
                placeholder="e.g. E-commerce Support, Booking Bot..."
                className="w-full bg-black/30 border border-purple-500/20 text-white placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50"
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
              className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-purple-500/10 rounded w-1/2 mb-3" />
                <div className="h-4 bg-purple-500/5 rounded w-3/4 mb-2" />
                <div className="h-4 bg-purple-500/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : chatbots.length === 0 ? (
          <div className="text-center py-20 border border-purple-500/10 rounded-2xl bg-[#1a1a2e]/30">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Bot size={28} className="text-purple-400" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No chatbots yet</h3>
            <p className="text-gray-500 text-sm mb-6">Create your first chatbot to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} /> Create Chatbot
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chatbots.map((bot) => (
              <div key={bot._id} className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-5 hover:border-purple-500/25 transition-all group">
                {/* Bot header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bot.primaryColor + "22" }}>
                      <Bot size={20} style={{ color: bot.primaryColor }} />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{bot.name}</h3>
                      <p className="text-gray-500 text-xs">{bot.botName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {bot.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                        <CheckCircle size={11} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">
                        <XCircle size={11} /> Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats row */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={11} />
                    Created {formatDate(bot.createdAt)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: bot.primaryColor }} />
                    {bot.faqs?.length || 0} FAQ{bot.faqs?.length !== 1 ? "s" : ""} · {bot.knowledgeBase ? "Has knowledge base" : "No knowledge base"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-3 border-t border-purple-500/10">
                  <button
                    onClick={() => router.push(`/dashboard/integration?botId=${bot._id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-lg text-xs font-medium transition-all"
                  >
                    <Settings size={13} /> Configure
                  </button>
                  <button
                    onClick={() => setConfirmId(bot._id)}
                    className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
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
