"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import {
  Code, Copy, Check, Eye, EyeOff, Save, Plus, Trash2,
  ChevronDown, ChevronRight, Bot, Upload, FileText, Settings2,
  Globe, Loader2, AlertCircle, Download, Send,
} from "lucide-react";
import ChatWidget from "@components/ChatWidget";
import { Input, Select, Textarea, Toggle } from "@components/ui";
import { ConfirmModal } from "@components/ui";
import api from "@lib/api";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

function CrawlSection({ botId, crawledSources = [], onCrawlDone, onClearAll }) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(null); // null | "crawling" | "done" | "error"
  const [lastInfo, setLastInfo] = useState(null);
  const [error, setError] = useState("");
  const [clearing, setClearing] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setStatus("crawling");
    setLastInfo(null);
    setError("");
    try {
      const { data } = await api.post(`/chatbots/${botId}/crawl`, { url: url.trim() });
      onCrawlDone(data.source, data.quickReplies || []);
      setLastInfo(data);
      setUrl("");
      setStatus("done");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to crawl website. Check the URL and try again.");
      setStatus("error");
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try { await onClearAll(); } finally { setClearing(false); }
  };

  const busy = status === "crawling";

  return (
    <div className="space-y-4">
      {/* Crawled sources list */}
      {crawledSources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Fetched sources</p>
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50"
            >
              {clearing ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
              Clear all
            </button>
          </div>
          <div className="space-y-1.5">
            {crawledSources.map((src, i) => (
              <div key={i} className="flex items-center gap-3 bg-purple-100 dark:bg-purple-500/5 border border-purple-300 dark:border-purple-500/15 rounded-lg px-3 py-2">
                <Globe size={13} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-900 dark:text-gray-200 truncate font-medium">{src.siteName || src.url}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-500 truncate">{src.url} · {src.pages} page{src.pages !== 1 ? "s" : ""}</p>
                </div>
                <Check size={13} className="text-green-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !busy && handleFetch()}
            placeholder="https://example.com"
            disabled={busy}
            className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40 disabled:opacity-50"
          />
        </div>
        <button
          onClick={handleFetch}
          disabled={!url.trim() || busy}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all whitespace-nowrap"
        >
          {busy
            ? <><Loader2 size={15} className="animate-spin" /> Crawling…</>
            : <><Globe size={15} /> {crawledSources.length > 0 ? "Add Source" : "Fetch & Save"}</>}
        </button>
      </div>

      {busy && (
        <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
          <Loader2 size={12} className="animate-spin" />
          Crawling pages… this may take 10–30 seconds
        </p>
      )}
      {status === "done" && lastInfo && (
        <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border border-green-300 dark:border-green-400/20 rounded-lg px-3 py-2">
          <Check size={13} />
          Fetched {lastInfo.pages} page{lastInfo.pages !== 1 ? "s" : ""} from <span className="font-medium ml-1">{lastInfo.siteName}</span> — saved automatically.
        </div>
      )}
      {status === "error" && (
        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border border-red-300 dark:border-red-400/20 rounded-lg px-3 py-2">
          <AlertCircle size={13} />
          {error}
        </div>
      )}
    </div>
  );
}

export default function IntegrationPage() {
  const router = useRouter();

  // Bot selector state
  const [chatbots, setChatbots] = useState([]);
  const [selectedBotId, setSelectedBotId] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("config");

  // Config state
  const [config, setConfig] = useState({
    name: "My Chatbot",
    botName: "Support Assistant",
    welcomeMessage: "Hello! How can I help you today?",
    primaryColor: "#7c3aed",
    position: "bottom-right",
    autoOpen: false,
    whatsappNumber: "",
    allowedDomains: [],
    botIconUrl: "",
  });
  const [canChangeIcon, setCanChangeIcon] = useState(false);
  const [iconInputKey, setIconInputKey] = useState(0);
  const [newDomain, setNewDomain] = useState("");

  // Knowledge base state
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [newQuickReply, setNewQuickReply] = useState({ question: "", answer: "" });
  const [crawledSources, setCrawledSources] = useState([]);
  const [embedToken, setEmbedToken] = useState(null);

  // Telegram state
  const [telegram, setTelegram] = useState({ botToken: "", chatId: "" });
  const [showBotToken, setShowBotToken] = useState(false);
  const [telegramSaving, setTelegramSaving] = useState(false);
  const [telegramSaved, setTelegramSaved] = useState(false);
  const [telegramError, setTelegramError] = useState("");
  const [detectingChatId, setDetectingChatId] = useState(false);
  const [detectMsg, setDetectMsg] = useState("");

  // UI state
  const [copied, setCopied] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const csvRef = useRef(null);

  // Check if user is admin and redirect
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData.role === "admin") {
          setIsAdmin(true);
          router.push("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [router]);

  // Load chatbots on mount, auto-select from URL ?botId=
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    Promise.all([
      api.get("/chatbots?limit=100"),
      api.get("/settings"),
      api.get("/auth/profile"),
    ]).then(([{ data: botsData }, { data: s }, { data: profile }]) => {
      const list = Array.isArray(botsData) ? botsData : (botsData.chatbots || []);
      setChatbots(list);
      const params = new URLSearchParams(window.location.search);
      const urlBotId = params.get("botId");
      if (urlBotId && list.find((b) => b._id === urlBotId)) {
        setSelectedBotId(urlBotId);
      } else if (list.length > 0) {
        setSelectedBotId(list[0]._id);
      }
      setTelegram({ botToken: s.telegramBotToken || "", chatId: s.telegramChatId || "" });
      setCanChangeIcon(!!profile.canChangeIcon);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Load selected bot config
  useEffect(() => {
    if (!selectedBotId) return;
    api.get(`/chatbots/${selectedBotId}`).then(({ data }) => {
      setConfig({
        name: data.name,
        botName: data.botName,
        welcomeMessage: data.welcomeMessage,
        primaryColor: data.primaryColor,
        position: data.position,
        autoOpen: data.autoOpen,
        whatsappNumber: data.whatsappNumber || "",
        allowedDomains: data.allowedDomains || [],
        botIconUrl: data.botIconUrl || "",
      });
      setKnowledgeBase(data.knowledgeBase || "");
      setFaqs(data.faqs || []);
      setQuickReplies(data.quickReplies || []);
      setCrawledSources(data.crawledSources || []);
      setShowWidget(false);
    }).catch(() => {});

    // Fetch encrypted embed token
    setEmbedToken(null);
    api.get(`/chatbots/${selectedBotId}/embed-token`)
      .then(({ data }) => setEmbedToken(data.token))
      .catch(() => {});
  }, [selectedBotId]);

  const [embedFramework, setEmbedFramework] = useState("html");

  const origin = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_FRONTEND_URL || "");
  const scriptSrc = embedToken ? `${origin}/api/widget-script?token=${embedToken}` : null;

  const embedSnippets = {
    html: scriptSrc
      ? `<!-- DoodleAI Chat Widget -->\n<script src="${scriptSrc}" defer></script>`
      : selectedBotId ? "<!-- Loading embed code... -->" : "Select a chatbot to generate embed code.",

    nextjs: scriptSrc
      ? `// Add to your app/layout.js (or pages/_app.js)\nimport Script from 'next/script'\n\nexport default function RootLayout({ children }) {\n  return (\n    <html>\n      <body>\n        {children}\n        <Script\n          src="${scriptSrc}"\n          strategy="afterInteractive"\n        />\n      </body>\n    </html>\n  )\n}`
      : selectedBotId ? "// Loading embed code..." : "// Select a chatbot to generate embed code.",

    react: scriptSrc
      ? `// Add to your App.jsx (or any top-level component)\nimport { useEffect } from 'react'\n\nexport default function App() {\n  useEffect(() => {\n    const script = document.createElement('script')\n    script.src = '${scriptSrc}'\n    script.defer = true\n    document.body.appendChild(script)\n    return () => document.body.removeChild(script)\n  }, [])\n\n  return (\n    // ... your app\n  )\n}`
      : selectedBotId ? "// Loading embed code..." : "// Select a chatbot to generate embed code.",

    wordpress: scriptSrc
      ? `<?php\n// Add to your theme's functions.php\nfunction doodleai_chat_widget() {\n    wp_enqueue_script(\n        'doodleai-widget',\n        '${scriptSrc}',\n        [],\n        null,\n        true  // load in footer\n    );\n}\nadd_action( 'wp_enqueue_scripts', 'doodleai_chat_widget' );`
      : selectedBotId ? "<?php\n// Loading embed code..." : "<?php\n// Select a chatbot to generate embed code.",
  };

  const activeSnippet = embedSnippets[embedFramework];

  const handleCopy = () => {
    if (!selectedBotId) return;
    navigator.clipboard.writeText(activeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Called by CrawlSection after successful crawl — backend already saved, just sync local state
  const handleCrawlDone = (source, suggestedQuickReplies) => {
    setCrawledSources((prev) => [...prev, source]);
    if (suggestedQuickReplies && suggestedQuickReplies.length > 0) {
      setQuickReplies(suggestedQuickReplies);
    }
  };

  const handleClearCrawlData = async () => {
    await api.delete(`/chatbots/${selectedBotId}/crawl-data`);
    setCrawledSources([]);
    setKnowledgeBase("");
  };

  const handleSave = async () => {
    if (!selectedBotId) return;
    setSaving(true);
    try {
      await api.put(`/chatbots/${selectedBotId}`, { ...config, knowledgeBase, faqs, quickReplies });
      setSaved(true);
      // Update chatbots list name
      setChatbots((prev) => prev.map((b) => b._id === selectedBotId ? { ...b, name: config.name, botName: config.botName, primaryColor: config.primaryColor } : b));
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // handled by api interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 300 * 1024) {
      alert("Image must be smaller than 300 KB.");
      setIconInputKey((k) => k + 1);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      update("botIconUrl", ev.target.result);
      setIconInputKey((k) => k + 1); // recreate input so same file can be re-selected
    };
    reader.readAsDataURL(file);
  };

  const handleDetectChatId = async () => {
    if (!telegram.botToken.trim()) {
      setTelegramError("Enter your Bot Token first.");
      return;
    }
    setDetectingChatId(true);
    setDetectMsg("");
    setTelegramError("");
    try {
      const res = await fetch(`https://api.telegram.org/bot${telegram.botToken.trim()}/getUpdates?limit=10`);
      const data = await res.json();
      if (!data.ok) {
        setTelegramError("Invalid Bot Token. Please double-check and try again.");
        setDetectingChatId(false);
        return;
      }
      if (!data.result || data.result.length === 0) {
        setDetectMsg("No messages found. Open Telegram, send any message to your bot (e.g. 'hi'), then click Auto-detect again.");
        setDetectingChatId(false);
        return;
      }
      // Search all updates for any chat id — handles message, edited_message, callback_query, etc.
      let foundId = null;
      for (const update of data.result) {
        const id =
          update.message?.chat?.id ??
          update.edited_message?.chat?.id ??
          update.channel_post?.chat?.id ??
          update.callback_query?.message?.chat?.id ??
          update.message?.from?.id ??
          null;
        if (id != null) { foundId = id; break; }
      }
      if (foundId == null) {
        setDetectMsg("Could not read Chat ID. Send a message to your bot and try again.");
        setDetectingChatId(false);
        return;
      }
      const chatId = String(foundId);
      setTelegram((prev) => ({ ...prev, chatId }));
      setTelegramError("");
      setDetectMsg(`Chat ID detected: ${chatId}`);
      setTimeout(() => setDetectMsg(""), 6000);
    } catch {
      setTelegramError("Network error. Check your internet connection and try again.");
    } finally {
      setDetectingChatId(false);
    }
  };

  const handleSaveTelegram = async () => {
    if (!telegram.botToken.trim() || !telegram.chatId.trim()) {
      setTelegramError("Both Bot Token and Chat ID are required.");
      return;
    }
    setTelegramError("");
    setTelegramSaving(true);
    try {
      await api.put("/settings", { telegramBotToken: telegram.botToken.trim(), telegramChatId: telegram.chatId.trim() });
      setTelegramSaved(true);
      setTimeout(() => setTelegramSaved(false), 3000);
    } catch {
      setTelegramError("Failed to save. Please try again.");
    } finally {
      setTelegramSaving(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    setTelegramSaving(true);
    try {
      await api.put("/settings", { telegramBotToken: "", telegramChatId: "" });
      setTelegram({ botToken: "", chatId: "" });
      setTelegramSaved(false);
    } catch {
      setTelegramError("Failed to disconnect.");
    } finally {
      setTelegramSaving(false);
    }
  };

  const update = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  // FAQ handlers
  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) return;
    setFaqs((prev) => [...prev, { ...newFaq }]);
    setNewFaq({ question: "", answer: "" });
    setShowAddFaq(false);
  };

  const updateFaq = (idx, field, value) => {
    setFaqs((prev) => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };

  const deleteFaq = (idx) => {
    setFaqs((prev) => prev.filter((_, i) => i !== idx));
    setDeleteConfirmIdx(null);
    if (expandedFaq === idx) setExpandedFaq(null);
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const rows = [
      ["Question", "Answer"],
      ["What are your business hours?", "We are open Monday to Friday, 9 AM to 6 PM EST."],
      ["How can I contact support?", "You can reach us at support@example.com or call +1-800-123-4567."],
      ["What is your return policy?", "We offer a 30-day return policy on all unused items in original packaging."],
      ["Do you offer free shipping?", "Yes, free shipping is available on orders over $50 within the US."],
      ["How long does delivery take?", "Standard delivery takes 3-5 business days. Express shipping is available at checkout."],
      ["Can I track my order?", "Yes, you will receive a tracking link via email once your order has been dispatched."],
      ["Do you ship internationally?", "Currently we ship to the US, UK, Canada, and Australia."],
      ["How do I reset my password?", "Click 'Forgot Password' on the login page and follow the instructions sent to your email."],
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "faq-sample.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // CSV import
  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(Boolean);
      const parsed = lines.slice(1).map((line) => {
        // Handle quoted CSV
        const match = line.match(/^"?([^",]+)"?,\s*"?(.+)"?\s*$/);
        if (match) return { question: match[1].trim(), answer: match[2].trim() };
        const parts = line.split(",");
        if (parts.length >= 2) return { question: parts[0].trim(), answer: parts.slice(1).join(",").trim() };
        return null;
      }).filter(Boolean);
      setFaqs((prev) => [...prev, ...parsed]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const tabs = [
    { id: "config", label: "Configuration", icon: Settings2 },
    { id: "knowledge", label: "Knowledge Base", icon: FileText },
    { id: "embed", label: "Embed Code", icon: Code },
  ];

  return (
    <DashboardLayout>
      {isAdmin ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-red-50 dark:bg-red-500/10 border border-red-300 dark:border-red-500/20 rounded-xl p-8 text-center">
            <AlertCircle size={48} className="text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page is not available for admin accounts. Redirecting to dashboard...
            </p>
          </div>
        </div>
      ) : (
      <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Website Integration</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Configure and embed your chatbot</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {/* Bot selector */}
            <div className="min-w-[200px]">
              <Select
                value={selectedBotId || ""}
                onChange={(e) => setSelectedBotId(e.target.value)}
                className="!bg-white dark:!bg-[#1a1a2e]/80 border border-gray-300 dark:border-purple-500/20 hover:border-purple-500/40 rounded-xl"
                options={
                  chatbots.length === 0
                    ? [{ value: "", label: "No chatbots" }]
                    : chatbots.map((b) => ({ value: b._id, label: b.name }))
                }
              />
            </div>
            <button
              onClick={() => router.push("/dashboard/chatbots")}
              className="flex items-center gap-2 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-purple-500/20 hover:border-purple-500/40 rounded-xl px-4 py-2.5 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
            >
              <Bot size={16} /> Manage Bots
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !selectedBotId}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-60 rounded-xl px-5 py-2.5 text-white font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              {saved ? <Check size={18} /> : <Save size={18} />}
              {saved ? "Saved!" : saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {!selectedBotId && !loading ? (
          <div className="text-center py-16 border border-gray-200 dark:border-purple-500/10 rounded-2xl bg-gray-50 dark:bg-[#1a1a2e]/30">
            <Bot size={40} className="text-purple-400/40 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No chatbot selected. Create one first.</p>
            <button
              onClick={() => router.push("/dashboard/chatbots")}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} /> Create Chatbot
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6">
              <div className="">
                {/* Tabs */}
                <div className="flex gap-1 mb-2 bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-xl p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.id
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                    >
                      <tab.icon size={15} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {activeTab === "config" && (
                  <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 space-y-5 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors min-h-[725px]">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Widget Configuration</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Input label="Display Name (internal)" value={config.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Store Bot" />
                      <Input label="Bot Name (shown to users)" value={config.botName} onChange={(e) => update("botName", e.target.value)} placeholder="Support Assistant" />
                    </div>

                    <Textarea label="Welcome Message" value={config.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)} rows={3} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Select
                        label="Widget Position"
                        value={config.position}
                        onChange={(e) => update("position", e.target.value)}
                        options={[
                          { value: "bottom-right", label: "Bottom Right" },
                          { value: "bottom-left", label: "Bottom Left" },
                          { value: "top-right", label: "Top Right" },
                          { value: "top-left", label: "Top Left" },
                        ]}
                      />
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 font-medium mb-1.5">Primary Color</label>
                        <div className="flex items-center gap-3">
                          <input type="color" value={config.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
                            className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-700/30 cursor-pointer bg-transparent" />
                          <span className="text-gray-600 dark:text-gray-400 text-sm font-mono">{config.primaryColor}</span>
                        </div>
                      </div>
                    </div>

                    <Toggle label="Auto-open on load" description="Show widget expanded when page loads" checked={config.autoOpen} onChange={(v) => update("autoOpen", v)} />

                    {/* Custom Bot Icon */}
                    {canChangeIcon && (
                      <div>
                        <label className="block text-sm text-gray-600 dark:text-gray-400 font-medium mb-1.5">
                          Bot Widget Icon
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-600 font-normal">PNG/JPG/SVG · max 300 KB</span>
                        </label>
                        <div className="flex items-center gap-4">
                          {/* Preview */}
                          <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-purple-500/30 flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50 dark:bg-black/20">
                            {config.botIconUrl ? (
                              <img src={config.botIconUrl} alt="bot icon" className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <Upload size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <label className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-all cursor-pointer">
                              <Upload size={14} /> {config.botIconUrl ? "Change Icon" : "Upload Icon"}
                              <input
                                key={iconInputKey}
                                type="file"
                                accept="image/*"
                                onChange={handleIconUpload}
                                className="hidden"
                              />
                            </label>
                            {config.botIconUrl && (
                              <button
                                type="button"
                                onClick={() => update("botIconUrl", "")}
                                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 text-sm font-medium rounded-xl transition-all"
                              >
                                <Trash2 size={14} /> Remove
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* <div>
                      <label className="block text-sm text-gray-400 font-medium mb-1.5">
                        WhatsApp Number
                        <span className="ml-2 text-xs text-gray-600 font-normal">Form submissions will be sent to this number</span>
                      </label>
                      <Input
                        placeholder="e.g. 15551234567 (country code + number, no + or spaces)"
                        value={config.whatsappNumber || ""}
                        onChange={(e) => update("whatsappNumber", e.target.value)}
                      />
                    </div> */}

                    {/* Allowed Domains */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                        Allowed Domains
                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-600 font-normal">Widget only appears on these domains. Leave empty to allow all.</span>
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={newDomain}
                          onChange={(e) => setNewDomain(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const d = newDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
                              if (d && !config.allowedDomains.includes(d)) {
                                update("allowedDomains", [...config.allowedDomains, d]);
                              }
                              setNewDomain("");
                            }
                          }}
                          placeholder="e.g. www.example.com"
                          className="flex-1 bg-white dark:bg-black/20 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                        />
                        <button
                          onClick={() => {
                            const d = newDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
                            if (d && !config.allowedDomains.includes(d)) {
                              update("allowedDomains", [...config.allowedDomains, d]);
                            }
                            setNewDomain("");
                          }}
                          disabled={!newDomain.trim()}
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all"
                        >
                          <Plus size={15} /> Add
                        </button>
                      </div>
                      {config.allowedDomains.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {config.allowedDomains.map((d, i) => (
                            <span key={i} className="flex items-center gap-1.5 bg-purple-100 dark:bg-purple-500/10 border border-purple-300 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs rounded-lg px-3 py-1.5">
                              {d}
                              <button onClick={() => update("allowedDomains", config.allowedDomains.filter((_, idx) => idx !== i))} className="text-purple-600 dark:text-purple-400 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-0.5">
                                <Trash2 size={11} />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-600">No restrictions — widget loads on any domain.</p>
                      )}
                    </div>

                    {/* Telegram Notifications */}
                    <div className="border-t border-gray-200 dark:border-purple-500/10 pt-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/20 flex items-center justify-center">
                            <Send size={15} className="text-[#229ED9]" />
                          </div>
                          <div>
                            <p className="text-gray-900 dark:text-white text-sm font-semibold">Telegram Lead Notifications</p>
                            <p className="text-gray-600 dark:text-gray-500 text-xs">Get new leads instantly in your Telegram</p>
                          </div>
                        </div>
                        {telegram.botToken && telegram.chatId && (
                          <span className="text-xs bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Check size={11} /> Connected
                          </span>
                        )}
                      </div>

                      {/* Steps */}
                      <div className="bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-purple-500/10 rounded-xl p-4 mb-4 space-y-3">
                        <p className="text-gray-700 dark:text-gray-300 text-xs font-semibold uppercase tracking-wide">How to set up (2 min)</p>
                        {[
                          { n: "1", text: 'Open Telegram → search "@BotFather" → tap Start' },
                          { n: "2", text: 'Send /newbot → enter a name → enter a username ending in "bot"' },
                          { n: "3", text: "BotFather gives you a Bot Token — paste it in the field below" },
                          { n: "4", text: 'Send any message to your new bot (e.g. "hi"), then click "Auto-detect Chat ID" — we will fill it automatically' },
                        ].map(({ n, text }) => (
                          <div key={n} className="flex gap-2.5 items-start">
                            <span className="w-5 h-5 rounded-full bg-purple-200 dark:bg-purple-600/20 border border-purple-400 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
                            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">{text}</p>
                          </div>
                        ))}
                      </div>

                      {/* Inputs */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 font-medium mb-1.5">Bot Token</label>
                          <div className="relative">
                            <input
                              type={showBotToken ? "text" : "password"}
                              value={telegram.botToken}
                              onChange={(e) => setTelegram({ ...telegram, botToken: e.target.value })}
                              placeholder="e.g. 7123456789:AAFxxxxxxxxxxxxxxxx"
                              className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 rounded-xl px-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                            />
                            <button type="button" onClick={() => setShowBotToken(!showBotToken)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                              {showBotToken ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 font-medium mb-1.5">
                            Chat ID
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-600 font-normal">Send any message to your bot first, then click Auto-detect</span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={telegram.chatId}
                              onChange={(e) => setTelegram({ ...telegram, chatId: e.target.value })}
                              placeholder="Click Auto-detect or enter manually"
                              className="flex-1 bg-white dark:bg-black/20 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-600 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                            />
                            <button
                              onClick={handleDetectChatId}
                              disabled={detectingChatId || !telegram.botToken.trim()}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#229ED9]/20 hover:bg-[#229ED9]/30 border border-[#229ED9]/30 disabled:opacity-50 text-[#229ED9] text-sm font-medium rounded-xl transition-all whitespace-nowrap"
                            >
                              {detectingChatId ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                              {detectingChatId ? "Detecting..." : "Auto-detect"}
                            </button>
                          </div>
                          {detectMsg && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mt-1.5">
                              <Check size={12} /> {detectMsg}
                            </p>
                          )}
                        </div>

                        {telegramError && (
                          <p className="text-xs text-red-700 dark:text-red-400 flex items-center gap-1.5">
                            <AlertCircle size={12} /> {telegramError}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={handleSaveTelegram}
                            disabled={telegramSaving}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-60 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
                          >
                            {telegramSaved ? <><Check size={15} /> Saved!</> : telegramSaving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : <><Send size={15} /> Save & Connect</>}
                          </button>
                          {telegram.botToken && telegram.chatId && (
                            <button onClick={handleDisconnectTelegram} disabled={telegramSaving}
                              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors disabled:opacity-50">
                              Disconnect
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "knowledge" && (
                  <div className="space-y-4">
                    {/* Fetch from Website */}
                    <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          Auto-fetch from Website
                        </h2>
                        <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">
                          Enter your website URL and we'll crawl up to 20 pages and extract the content automatically.
                        </p>
                      </div>
                      <CrawlSection
                        botId={selectedBotId}
                        crawledSources={crawledSources}
                        onCrawlDone={handleCrawlDone}
                        onClearAll={handleClearCrawlData}
                      />
                    </div>

                    {/* FAQ Builder */}
                    <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">FAQ Entries</h2>
                          <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{faqs.length} question{faqs.length !== 1 ? "s" : ""} added</p>
                        </div>
                        <div className="flex gap-2">
                          <input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
                          <button
                            onClick={handleDownloadSample}
                            title="Download sample CSV"
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-purple-500/20 hover:border-purple-500/40 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 !text-sm transition-all"
                          >
                            <Download size={13} /> Sample
                          </button>
                          <button
                            onClick={() => csvRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#1a1a2e]/80 border border-gray-300 dark:border-purple-500/20 hover:border-purple-500/40 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 !text-sm transition-all"
                          >
                            <Upload size={13} /> Import CSV
                          </button>
                          <button
                            onClick={() => setShowAddFaq(true)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white !text-sm transition-all"
                          >
                            <Plus size={13} /> Add FAQ
                          </button>
                        </div>
                      </div>

                      {/* Add new FAQ inline form */}
                      {showAddFaq && (
                        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-300 dark:border-purple-500/20 rounded-xl space-y-3">
                          <input
                            autoFocus
                            value={newFaq.question}
                            onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
                            placeholder="Question (e.g. What are your business hours?)"
                            className="w-full bg-white dark:bg-black/30 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                          />
                          <textarea
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
                            placeholder="Answer"
                            rows={3}
                            className="w-full bg-white dark:bg-black/30 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                          />
                          <div className="flex gap-2">
                            <button onClick={addFaq} disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs rounded-lg font-medium transition-all">
                              Add
                            </button>
                            <button onClick={() => { setShowAddFaq(false); setNewFaq({ question: "", answer: "" }); }}
                              className="px-4 py-1.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-lg transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* FAQ list */}
                      {faqs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-600 text-sm border border-dashed border-gray-300 dark:border-purple-500/10 rounded-xl">
                          No FAQ entries yet. Add questions and answers above, or import from CSV.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {faqs.map((faq, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-purple-500/10 rounded-xl overflow-hidden">
                              {/* Accordion header */}
                              <div
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-purple-500/5 transition-colors"
                                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                              >
                                {expandedFaq === idx ? (
                                  <ChevronDown size={15} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                ) : (
                                  <ChevronRight size={15} className="text-gray-500 dark:text-gray-600 flex-shrink-0" />
                                )}
                                <span className="flex-1 text-sm text-gray-900 dark:text-gray-200 truncate">{faq.question}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmIdx(idx); }}
                                  className="p-1 text-gray-500 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Expanded: editable answer */}
                              {expandedFaq === idx && (
                                <div className="px-4 pb-4 bg-gray-50 dark:bg-black/10 space-y-2">
                                  <input
                                    value={faq.question}
                                    onChange={(e) => updateFaq(idx, "question", e.target.value)}
                                    className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                  />
                                  <textarea
                                    value={faq.answer}
                                    onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                                    rows={3}
                                    className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* CSV format hint */}
                      <p className="text-gray-500 dark:text-gray-600 text-xs mt-4">
                        CSV format: two columns — <code className="text-purple-600 dark:text-purple-400">Question, Answer</code> (first row treated as header and skipped)
                      </p>
                    </div>

                    {/* Quick Reply Buttons */}
                    <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors">
                      <div className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Reply Buttons</h2>
                        <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">
                          Clickable buttons shown when the widget opens. Each button has a question (label) and a pre-written answer shown instantly — no AI call needed.
                        </p>
                      </div>

                      {/* Add form */}
                      <div className="space-y-2 mb-4 p-4 bg-purple-50 dark:bg-purple-500/5 border border-purple-300 dark:border-purple-500/15 rounded-xl">
                        <input
                          value={newQuickReply.question || ""}
                          onChange={(e) => setNewQuickReply((p) => ({ ...p, question: e.target.value }))}
                          placeholder="Question (button label) — e.g. What are your business hours?"
                          className="w-full bg-white dark:bg-black/30 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                        />
                        <textarea
                          value={newQuickReply.answer || ""}
                          onChange={(e) => setNewQuickReply((p) => ({ ...p, answer: e.target.value }))}
                          placeholder="Answer shown instantly when button is clicked — e.g. We are open Mon–Fri, 9am to 6pm."
                          rows={3}
                          className="w-full bg-white dark:bg-black/30 border border-gray-300 dark:border-purple-500/15 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                        />
                        <button
                          onClick={() => {
                            if (!newQuickReply.question?.trim()) return;
                            setQuickReplies((p) => [...p, { question: newQuickReply.question.trim(), answer: newQuickReply.answer?.trim() || "" }]);
                            setNewQuickReply({ question: "", answer: "" });
                          }}
                          disabled={!newQuickReply.question?.trim()}
                          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
                        >
                          <Plus size={14} /> Add Quick Reply
                        </button>
                      </div>

                      {/* List */}
                      {quickReplies.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-600 text-sm border border-dashed border-gray-300 dark:border-purple-500/10 rounded-xl">
                          No quick reply buttons yet. Add a question and answer above.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {quickReplies.map((qr, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-purple-500/10 rounded-xl overflow-hidden">
                              <div className="flex items-center gap-3 px-4 py-2.5 bg-gray-50 dark:bg-black/10">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900 dark:text-gray-200 font-medium truncate">{qr.question}</p>
                                  {qr.answer && (
                                    <p className="text-xs text-gray-600 dark:text-gray-500 truncate mt-0.5">{qr.answer}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => setQuickReplies((p) => p.filter((_, i) => i !== idx))}
                                  className="text-gray-500 dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-gray-500 dark:text-gray-600 text-xs mt-3">
                        If an answer is provided, it's shown instantly. If left empty, the question is sent to the AI.
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "embed" && (
                  <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 space-y-5 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors min-h-[725px]">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Code size={20} /> Embed Code
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        Choose your framework and add the snippet to your project.
                      </p>
                    </div>

                    {/* Framework tabs */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "html", label: "HTML" },
                        { id: "nextjs", label: "Next.js" },
                        { id: "react", label: "React" },
                        { id: "wordpress", label: "WordPress" },
                      ].map((fw) => (
                        <button
                          key={fw.id}
                          onClick={() => setEmbedFramework(fw.id)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            embedFramework === fw.id
                              ? "bg-purple-600 text-white"
                              : "bg-purple-100 dark:bg-purple-500/10 text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-purple-200 dark:hover:bg-purple-500/20"
                          }`}
                        >
                          {fw.label}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <pre className="bg-gray-900 dark:bg-black border border-gray-700 dark:border-purple-500/10 rounded-xl p-4 overflow-x-auto text-xs text-gray-300 dark:text-gray-400 leading-relaxed whitespace-pre-wrap break-all pe-16">
                        {activeSnippet}
                      </pre>
                      <button
                        onClick={handleCopy}
                        className="absolute top-3 right-3 p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 rounded-lg transition-colors"
                      >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-purple-400" />}
                      </button>
                    </div>

                    <div className="space-y-4 pt-2">
                      <h3 className="text-gray-900 dark:text-white font-medium">Installation Steps</h3>
                      {embedFramework === "html" && [
                        "Copy the embed code above",
                        "Paste it before the closing </body> tag on your website",
                        "Save & deploy — the widget appears automatically",
                      ].map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm pt-1">{step}</p>
                        </div>
                      ))}
                      {embedFramework === "nextjs" && [
                        "Copy the code above",
                        "Open your app/layout.js (or pages/_app.js for Pages Router)",
                        "Import Script from 'next/script' and add it inside the body as shown",
                        "The strategy=\"afterInteractive\" loads the widget after the page is interactive",
                      ].map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm pt-1">{step}</p>
                        </div>
                      ))}
                      {embedFramework === "react" && [
                        "Copy the useEffect code above",
                        "Add it to your top-level App.jsx component",
                        "The script loads once on mount and is cleaned up on unmount",
                      ].map((step, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm pt-1">{step}</p>
                        </div>
                      ))}
                      {embedFramework === "wordpress" && (
                        <>
                          {[
                            "Copy the PHP code above",
                            "Go to Appearance → Theme File Editor in your WordPress admin",
                            "Open functions.php and paste the code at the bottom",
                            "Click Update File — the widget will appear on every page",
                          ].map((step, i) => (
                            <div key={i} className="flex gap-3 items-start">
                              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm pt-1">{step}</p>
                            </div>
                          ))}
                          <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-500/5 border border-purple-300 dark:border-purple-500/15 rounded-xl">
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                              <span className="text-purple-600 dark:text-purple-400 font-medium">Alternative:</span> Install the free{" "}
                              <span className="text-gray-900 dark:text-white">"Insert Headers and Footers"</span> plugin, then paste the HTML{" "}
                              <code className="text-purple-600 dark:text-purple-300">&lt;script&gt;</code> tag from the HTML tab into the Footer Scripts field.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="sticky top-[-20px] self-start">
                {/* Live Preview — always visible */}
                <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-purple-500/20 transition-colors h-full min-h-[100vh]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Live Preview</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">See exactly how your widget will look</p>
                    </div>
                    <button
                      onClick={() => setShowWidget(!showWidget)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg px-4 py-2 text-white transition-all hover:shadow-lg hover:shadow-purple-500/20"
                    >
                      {showWidget ? <EyeOff size={18} /> : <Eye size={18} />}
                      {showWidget ? "Hide Widget" : "Preview Widget"}
                    </button>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-xl h-[calc(100vh-70px)] relative border border-gray-300 dark:border-gray-700 overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center text-center text-gray-500 dark:text-gray-600 pointer-events-none select-none">
                      <div>
                        <Code size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm opacity-60">Your website content here</p>
                        <p className="text-xs mt-1 opacity-40">{showWidget ? "Widget preview active — interact with it!" : "Click 'Preview Widget' to test the chatbot"}</p>
                      </div>
                    </div>
                    {showWidget && (
                      <ChatWidget
                        botId={selectedBotId}
                        botName={config.botName}
                        welcomeMessage={config.welcomeMessage}
                        primaryColor={config.primaryColor}
                        position={config.position}
                        preview={true}
                        faqs={faqs}
                        quickReplies={quickReplies}
                        whatsappNumber={config.whatsappNumber}
                        botIconUrl={config.botIconUrl}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <ConfirmModal
        open={deleteConfirmIdx !== null}
        title="Delete FAQ?"
        message="Remove this question and answer from the knowledge base."
        confirmLabel="Delete"
        onConfirm={() => deleteFaq(deleteConfirmIdx)}
        onCancel={() => setDeleteConfirmIdx(null)}
      />
      </>
      )}
    </DashboardLayout>
  );
}

