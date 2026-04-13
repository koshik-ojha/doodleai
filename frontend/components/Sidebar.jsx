"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, LogOut, Home, Menu, X } from "lucide-react";
import { useChatStore } from "@store/chatStore";

export default function Sidebar({ onHome }) {
  const { chats, activeChat, createChat, setActiveChat, fetchMessages, deleteChat } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close sidebar on chat selection (mobile)
  useEffect(() => {
    if (isMobile && activeChat) setIsOpen(false);
  }, [activeChat, isMobile]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 p-3 bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg md:hidden touch-manipulation"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        ${isMobile 
          ? 'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out' 
          : 'relative w-72'
        }
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col
      `}>
        {/* Mobile Close Button */}
        {isMobile && (
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-lg transition-colors md:hidden touch-manipulation"
          >
            <X size={20} />
          </button>
        )}

        {onHome && (
          <button onClick={onHome} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 rounded-xl py-3 mb-2 touch-manipulation">
            <Home size={18} /> Home
          </button>
        )}
        <button onClick={createChat} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-xl py-3 mb-4 touch-manipulation">
          <Plus size={18} /> New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              className={`group flex items-center justify-between rounded-xl px-3 py-3 cursor-pointer touch-manipulation ${
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
                className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-400 touch-manipulation"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <button onClick={logout} className="mt-4 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl py-3 touch-manipulation">
          <LogOut size={18} /> Logout
        </button>
      </aside>
    </>
  );
}

