"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import {
  Plus, Send, Sparkles, Trash2, MessageSquare, Search,
  Download, Share2, Settings,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ConfirmModal } from "@components/ui";
import { useChatStore } from "@store/chatStore";

export default function ChatPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [search, setSearch] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef(null);
  const optionsRef = useRef(null);
  const textareaRef = useRef(null);

  const {
    chats,
    activeChat,
    messages,
    loading,
    fetchChats,
    createChat,
    setActiveChat,
    fetchMessages,
    sendMessage,
    deleteChat,
  } = useChatStore();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    fetchChats();
  }, []);

  // Auto-select chat when navigating from conversations page (?id=...)
  useEffect(() => {
    if (!chats.length) return;
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get("id");
    if (!targetId) return;
    const found = chats.find((c) => c._id === targetId);
    if (found && activeChat?._id !== found._id) {
      setActiveChat(found);
      fetchMessages(found._id);
    }
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [input]);

  const handleSelectChat = (chat) => {
    setActiveChat(chat);
    fetchMessages(chat._id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleNewChat = async () => {
    const chat = await createChat();
    if (chat) fetchMessages(chat._id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");

    let chat = activeChat;
    if (!chat) {
      chat = await createChat();
    }
    if (chat) {
      await sendMessage(chat._id, msg);
      // Refresh chat list so title updates after first message
      fetchChats();
    }
  };

  const handleDelete = async () => {
    await deleteChat(confirmId);
    setConfirmId(null);
  };

  const handleExport = () => {
    if (!messages.length) return;
    const text = messages.map((m) => `[${m.role}]: ${m.content}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${activeChat?.title ?? "export"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setShowOptions(false);
  };

  const handleShare = () => {
    if (!navigator.share || !messages.length) return;
    const text = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
    navigator.share({ title: activeChat?.title ?? "Chat", text }).catch(() => {});
    setShowOptions(false);
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-120px)] md:h-[calc(100vh-120px)] flex gap-4 overflow-hidden relative">

        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Chat List Sidebar ── */}
        <aside className={`
          ${isMobile 
            ? 'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out' 
            : 'relative w-64'
          }
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
          flex-shrink-0 flex flex-col bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl overflow-hidden
        `}>
          {/* New Chat */}
          <div className="p-3 border-b border-gray-200 dark:border-purple-500/10">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 rounded-xl py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              <Plus size={15} />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-purple-500/10">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-3.5 text-gray-400 dark:text-gray-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search chats…"
                className="w-full bg-gray-100 dark:bg-black/20 text-gray-900 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-600 rounded-lg pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/40 border border-transparent focus:border-purple-500/20"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredChats.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-700 text-xs text-center py-8">
                {search ? "No chats match" : "No chats yet"}
              </p>
            ) : (
              filteredChats.map((chat) => {
                const isActive = activeChat?._id === chat._id;
                return (
                  <div
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                      isActive
                        ? "bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-500/30"
                        : "hover:bg-gray-50 dark:hover:bg-purple-500/10 border border-transparent"
                    }`}
                  >
                    {/* <MessageSquare
                      size={13}
                      className={`flex-shrink-0 ${isActive ? "text-purple-400" : "text-gray-600"}`}
                    /> */}
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-gray-300 text-xs truncate leading-tight">{chat.title}</p>
                      <p className="text-gray-500 dark:text-gray-700 text-[10px] mt-0.5">{timeAgo(chat.updatedAt)} ago</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmId(chat._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/10 text-gray-500 dark:text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer count */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-purple-500/10">
            <p className="text-gray-500 dark:text-gray-700 text-[10px] text-center">
              {chats.length} conversation{chats.length !== 1 ? "s" : ""}
            </p>
          </div>
        </aside>

        {/* Mobile Toggle Button */}
        {isMobile && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed bottom-6 left-6 z-30 p-4 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg md:hidden touch-manipulation"
          >
            <MessageSquare size={20} />
          </button>
        )}

        {/* ── Chat Window ── */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0a0a1a]/50 rounded-2xl border border-gray-200 dark:border-purple-500/10 overflow-hidden min-w-0">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-purple-500/10">
            <div className="flex items-center gap-2 min-w-0">
              {activeChat ? (
                <>
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{activeChat.title}</p>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-500 text-sm">AI Chatbot</p>
              )}
            </div>

            {activeChat && (
              <div className="relative" ref={optionsRef}>
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-purple-500/10 rounded-lg text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <Settings size={16} />
                </button>
                {showOptions && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1a1a2e]/95 backdrop-blur-xl border border-gray-200 dark:border-purple-500/20 rounded-xl shadow-2xl overflow-hidden z-50">
                    <button
                      onClick={handleExport}
                      className="w-full px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 text-sm flex items-center gap-2 border-b border-gray-200 dark:border-purple-500/10"
                    >
                      <Download size={14} /> Export as text
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-full px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-500/10 text-sm flex items-center gap-2 border-b border-gray-200 dark:border-purple-500/10"
                    >
                      <Share2 size={14} /> Share
                    </button>
                    <button
                      onClick={() => { setConfirmId(activeChat._id); setShowOptions(false); }}
                      className="w-full px-4 py-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete chat
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5">
            {!activeChat ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center mb-4">
                  <Sparkles size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-gray-900 dark:text-white text-base font-semibold mb-1">Start a conversation</h2>
                <p className="text-gray-600 dark:text-gray-500 text-sm mb-6">Click "New Chat" or select one from the sidebar</p>
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                  <Plus size={15} /> New Chat
                </button>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-600 text-sm">Send a message to begin</p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto w-full space-y-5">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex gap-3 max-w-[82%]">
                        <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkles size={13} className="text-white" />
                        </div>
                        <div className="bg-white dark:bg-[#1a1a2e]/90 border border-gray-200 dark:border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3 prose dark:prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="bg-gradient-to-br from-purple-600 to-purple-500 rounded-2xl rounded-tr-none px-4 py-3 max-w-[82%]">
                        <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[82%]">
                      <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles size={13} className="text-white" />
                      </div>
                        <div className="bg-white dark:bg-[#1a1a2e]/90 border border-gray-200 dark:border-purple-500/20 rounded-2xl rounded-tl-none px-4 py-3">
                          <div className="flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-purple-500/10 safe-bottom">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-purple-500/20 rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={activeChat ? "Ask anything…" : "Type to start a new chat…"}
                  rows={1}
                  className="flex-1 bg-transparent text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 text-sm sm:text-base resize-none focus:outline-none leading-relaxed !h-auto !lg:h-[120px]"
                  style={{ minHeight: "22px", maxHeight: "120px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2.5 sm:p-3 bg-purple-100 dark:bg-purple-500/20 hover:bg-purple-600 border border-purple-300 dark:border-purple-500/30 hover:border-purple-500/50 rounded-xl text-purple-600 dark:text-purple-400 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0 touch-manipulation"
                >
                  <Send size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
              <p className="text-center text-[11px] text-gray-500 dark:text-gray-700 mt-2">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmId}
        title="Delete chat?"
        message="This will permanently delete the conversation and all its messages."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </DashboardLayout>
  );
}

