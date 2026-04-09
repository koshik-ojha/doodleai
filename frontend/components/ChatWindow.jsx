"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useChatStore } from "@store/chatStore";
import Input from "@components/ui/Input";

export default function ChatWindow() {
  const { activeChat, messages, sendMessage, loading } = useChatStore();
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;
    const msg = input;
    setInput("");
    await sendMessage(activeChat._id, msg);
  };

  if (!activeChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select or create a chat to start.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`max-w-4xl rounded-2xl px-4 py-3 ${
            msg.role === "user" ? "ml-auto bg-blue-600" : "mr-auto bg-zinc-800"
          }`}>
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && <div className="text-zinc-400">AI is typing...</div>}
      </div>

      <div className="p-4 border-t border-zinc-800">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            className="flex-1 !rounded-xl !py-3"
          />
          <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 rounded-xl px-5 py-3">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
