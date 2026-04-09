"use client";

import { Plus, Trash2, LogOut, Home } from "lucide-react";
import { useChatStore } from "@store/chatStore";

export default function Sidebar({ onHome }) {
  const { chats, activeChat, createChat, setActiveChat, fetchMessages, deleteChat } = useChatStore();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="w-72 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col">
      {onHome && (
        <button onClick={onHome} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 rounded-xl py-3 mb-2">
          <Home size={18} /> Home
        </button>
      )}
      <button onClick={createChat} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl py-3 mb-4">
        <Plus size={18} /> New Chat
      </button>

      <div className="flex-1 overflow-y-auto space-y-2">
        {chats.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-center justify-between rounded-xl px-3 py-3 cursor-pointer ${
              activeChat?._id === chat._id ? "bg-zinc-800" : "hover:bg-zinc-800/70"
            }`}
            onClick={() => {
              setActiveChat(chat);
              fetchMessages(chat._id);
            }}
          >
            <span className="truncate text-sm">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteChat(chat._id);
              }}
              className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={logout} className="mt-4 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl py-3">
        <LogOut size={18} /> Logout
      </button>
    </div>
  );
}
