import { create } from "zustand";
import api from "@lib/api";

export const useChatStore = create((set) => ({
  chats: [],
  activeChat: null,
  messages: [],
  loading: false,

  fetchChats: async () => {
    const { data } = await api.get("/chats?limit=100");
    const list = Array.isArray(data) ? data : (data.chats || []);
    set({ chats: list });
  },

  createChat: async () => {
    const { data } = await api.post("/chats");
    set((state) => ({ chats: [data, ...state.chats], activeChat: data, messages: [] }));
    return data;
  },

  setActiveChat: (chat) => set({ activeChat: chat }),

  fetchMessages: async (chatId) => {
    const { data } = await api.get(`/chats/${chatId}/messages`);
    set({ messages: data });
  },

  sendMessage: async (chatId, message) => {
    set((state) => ({
      messages: [...state.messages, { role: "user", content: message }],
      loading: true
    }));

    const { data } = await api.post(`/chats/${chatId}/messages`, { message });

    set((state) => ({
      messages: [...state.messages, data.reply],
      loading: false
    }));
  },

  deleteChat: async (chatId) => {
    await api.delete(`/chats/${chatId}`);
    set((state) => ({
      chats: state.chats.filter((c) => c._id !== chatId),
      activeChat: state.activeChat?._id === chatId ? null : state.activeChat,
      messages: state.activeChat?._id === chatId ? [] : state.messages
    }));
  }
}));
