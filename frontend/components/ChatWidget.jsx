"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";
import BotWidget, { SvgIcon as BotIcon } from "@components/BotWidget";
import ChatbotForm from "./ChatbotForm";
import QuickReplies from "./QuickReplies";
import Input from "@components/ui/Input";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChatWidget({
  botId = null,
  domain = "",
  botName = "Support Assistant",
  welcomeMessage = "Hello! How can I help you today?",
  primaryColor = "#7c3aed",
  position = "bottom-right",
  preview = false,
  faqs = [],
  quickReplies = [],
  whatsappNumber = "",
  botIconUrl = "",
}) {
  const [isOpen, setIsOpen] = useState(preview); // Auto-open in preview mode
  const [view, setView] = useState("quick"); // "quick" | "chat" | "form"
  const [formType, setFormType] = useState("contact"); // "contact" | "quote" | "consultation"
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const bottomRef = useRef(null);

  const positionKey = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  }[position] || "bottom-6 right-6";

  const positionClass = `${preview ? "absolute" : "fixed"} ${positionKey}`;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setView("chat");

    setMessages((prev) => [...prev, { role: "user", content: msg, time: new Date() }]);
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/widget/message`, {
        message: msg,
        sessionId,
        botId,
        ...(domain && { domain }),
      });
      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, time: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Sorry, I'm having trouble responding. Please try again.",
        time: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      await axios.post(`${API_URL}/api/submissions`, {
        ...formData,
        subject: formData.subject || formType,
        formType,
        botId,
      });
    } catch (e) {
      console.error("Form submission error:", e);
    }
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`${positionClass} z-50 hover:scale-110 transition-transform bg-transparent border-0 p-0 cursor-pointer`}
      >
        <BotWidget iconUrl={botIconUrl} />
      </button>
    );
  }

  return (
    <div className={`
      ${positionClass} z-50 flex flex-col overflow-hidden bg-white dark:bg-white shadow-2xl
      ${preview ? 'w-[380px] h-[600px] rounded-3xl' : 'inset-0 w-full h-full rounded-none md:w-[380px] md:h-[600px] md:rounded-3xl md:inset-auto'}
    `}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }} className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BotIcon size={44} className="rounded-full" iconUrl={botIconUrl} />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-base md:text-base">{botName}</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <p className="text-white/80 text-xs">Online</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-white" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {view === "quick" && (
          <div className="p-4">
            <div className="flex gap-3 mb-4">
              <BotIcon size={40} className="flex-shrink-0" iconUrl={botIconUrl} />
              <div className="bg-white dark:bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
                <p className="text-gray-800 dark:text-gray-800 text-[13px]">{welcomeMessage}</p>
              </div>
            </div>
            <QuickReplies
              primaryColor={primaryColor}
              faqs={faqs}
              quickReplies={quickReplies}
              onSelect={(text) => {
                if (text === "Fill out contact form") { setFormType("contact"); setView("form"); return; }
                if (text === "Request a quote") { setFormType("quote"); setView("form"); return; }
                if (text === "Schedule a consultation") { setFormType("consultation"); setView("form"); return; }
                // Check FAQs first, then quick replies for a predefined answer
                const match =
                  faqs.find((f) => f.question === text) ||
                  quickReplies.find((qr) => (typeof qr === "string" ? qr : qr.question) === text);
                if (match && typeof match === "object" && match.answer) {
                  // Show instantly without AI call
                  setView("chat");
                  setMessages((prev) => [
                    ...prev,
                    { role: "user", content: match.question, time: new Date() },
                    { role: "assistant", content: match.answer, time: new Date() },
                  ]);
                } else {
                  sendMessage(text);
                }
              }}
            />
          </div>
        )}

        {view === "form" && (
          <div className="p-4 h-full">
            <ChatbotForm
              onSubmit={handleFormSubmit}
              onClose={() => setView("quick")}
              formType={formType}
              primaryColor={primaryColor}
              whatsappNumber={whatsappNumber}
            />
          </div>
        )}

        {view === "chat" && (
          <div className="p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <BotIcon size={36} className="flex-shrink-0" iconUrl={botIconUrl} />
                )}
                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 dark:text-gray-600 text-[13px] font-semibold">U</span>
                  </div>
                )}
                <div className={`flex flex-col max-w-[80%] md:max-w-[72%]`}>
                  <div className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                    msg.role === "user"
                      ? "text-white dark:text-white rounded-tr-none"
                      : "bg-white dark:bg-white text-gray-800 dark:text-gray-800 shadow-sm rounded-tl-none"
                  }`} style={msg.role === "user" ? { backgroundColor: primaryColor } : {}}>
                    {msg.content}
                  </div>
                  <span className={`text-xs text-gray-400 mt-1 px-1 ${msg.role === "user" ? "text-right" : ""}`}>
                    {formatTime(msg.time)}
                  </span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: primaryColor + "22" }}>
                  <BotIcon size={18} style={{ color: primaryColor }} />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-gray-400" />
                  <span className="text-gray-400 text-[13px]">Typing...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {view !== "form" && (
        <div className="p-4 bg-white border-t border-gray-100">
          {view === "chat" && (
            <button
              onClick={() => setView("quick")}
              className="text-xs text-gray-400 hover:text-gray-600 mb-2 transition-colors"
            >
              ← Back to menu
            </button>
          )}
          <div className="flex gap-2 items-center">
            <Input
              variant="light"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              style={{ "--primary": primaryColor }}
              className="!flex-1 !border !bg-gray-50 !text-gray-900 !rounded-full !px-4 !py-2.5 !leading-normal !text-[13px] !shadow-none !outline-none focus:!outline-none focus-visible:!outline-none focus:![border-color:var(--primary)] transition-all"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-105 disabled:opacity-50 flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

