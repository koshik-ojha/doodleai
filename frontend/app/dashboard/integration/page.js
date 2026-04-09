"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import {
  Code, Copy, Check, Eye, EyeOff, Save, Plus, Trash2,
  ChevronDown, ChevronRight, Bot, Upload, FileText, Settings2,
} from "lucide-react";
import ChatWidget from "@components/ChatWidget";
import { Input, Select, Textarea, Toggle } from "@components/ui";
import { ConfirmModal } from "@components/ui";
import api from "@lib/api";

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  });

  // Knowledge base state
  const [knowledgeBase, setKnowledgeBase] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "" });
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [newQuickReply, setNewQuickReply] = useState({ question: "", answer: "" });

  // UI state
  const [copied, setCopied] = useState(false);
  const [showWidget, setShowWidget] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const csvRef = useRef(null);

  // Load chatbots on mount, auto-select from URL ?botId=
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    api.get("/chatbots").then(({ data }) => {
      setChatbots(data);
      const params = new URLSearchParams(window.location.search);
      const urlBotId = params.get("botId");
      if (urlBotId && data.find((b) => b._id === urlBotId)) {
        setSelectedBotId(urlBotId);
      } else if (data.length > 0) {
        setSelectedBotId(data[0]._id);
      }
    }).catch(console.error).finally(() => setLoading(false));
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
      });
      setKnowledgeBase(data.knowledgeBase || "");
      setFaqs(data.faqs || []);
      setQuickReplies(data.quickReplies || []);
      setShowWidget(false);
    }).catch(console.error);
  }, [selectedBotId]);

  const embedCode = selectedBotId
    ? `<!-- AI Chatbot Widget -->
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${FRONTEND_URL}/widget?botId=${selectedBotId}';
    iframe.style.cssText = 'position:fixed;bottom:0;right:0;width:420px;height:680px;border:none;z-index:9999;background:transparent;';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowtransparency', 'true');
    iframe.setAttribute('title', 'Chat Widget');
    document.body.appendChild(iframe);
  })();
</script>`
    : "Select a chatbot to generate embed code.";

  const handleCopy = () => {
    if (!selectedBotId) return;
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-white">Website Integration</h1>
            <p className="text-gray-400 mt-1">Configure and embed your chatbot</p>
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            {/* Bot selector */}
            <select
              value={selectedBotId || ""}
              onChange={(e) => setSelectedBotId(e.target.value)}
              className="bg-[#1a1a2e]/80 border border-purple-500/20 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            >
              {chatbots.length === 0 && <option value="">No chatbots</option>}
              {chatbots.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={() => router.push("/dashboard/chatbots")}
              className="flex items-center gap-2 bg-[#1a1a2e]/80 border border-purple-500/20 hover:border-purple-500/40 rounded-xl px-4 py-2.5 text-gray-300 text-sm font-medium transition-all"
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
          <div className="text-center py-16 border border-purple-500/10 rounded-2xl bg-[#1a1a2e]/30">
            <Bot size={40} className="text-purple-400/40 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No chatbot selected. Create one first.</p>
            <button
              onClick={() => router.push("/dashboard/chatbots")}
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 rounded-xl px-5 py-2.5 text-white text-sm font-medium transition-all"
            >
              <Plus size={15} /> Create Chatbot
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex gap-1 bg-[#1a1a2e]/50 border border-purple-500/10 rounded-xl p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "config" && (
              <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 space-y-5 hover:border-purple-500/20 transition-colors">
                <h2 className="text-xl font-semibold text-white">Widget Configuration</h2>

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
                    <label className="block text-sm text-gray-400 font-medium mb-1.5">Primary Color</label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={config.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
                        className="w-12 h-10 rounded-lg border border-gray-700/30 cursor-pointer bg-transparent" />
                      <span className="text-gray-400 text-sm font-mono">{config.primaryColor}</span>
                    </div>
                  </div>
                </div>

                <Toggle label="Auto-open on load" description="Show widget expanded when page loads" checked={config.autoOpen} onChange={(v) => update("autoOpen", v)} />

                <div>
                  <label className="block text-sm text-gray-400 font-medium mb-1.5">
                    WhatsApp Number
                    <span className="ml-2 text-xs text-gray-600 font-normal">Form submissions will be sent to this number</span>
                  </label>
                  <Input
                    placeholder="e.g. 15551234567 (country code + number, no + or spaces)"
                    value={config.whatsappNumber || ""}
                    onChange={(e) => update("whatsappNumber", e.target.value)}
                  />
                </div>
              </div>
            )}

            {activeTab === "knowledge" && (
              <div className="space-y-4">
                {/* General Knowledge */}
                <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-white">General Site Knowledge</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Describe your website, products, services, policies, and any information the chatbot should know about.
                      The bot will answer questions ONLY based on this content.
                    </p>
                  </div>
                  <textarea
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    rows={10}
                    placeholder={`Example:\nWe are TechStore, an online electronics retailer.\n\nProducts: Laptops, phones, tablets, accessories.\nReturn Policy: 30-day returns on all items.\nShipping: Free shipping over $50. 3-5 business days.\nSupport hours: Mon-Fri 9am-6pm EST.\nContact: support@techstore.com | +1-800-123-4567`}
                    className="w-full bg-black/20 border border-purple-500/15 text-gray-200 placeholder-gray-600 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40 leading-relaxed"
                  />
                  <p className="text-gray-600 text-xs mt-2">{knowledgeBase.length} characters</p>
                </div>

                {/* FAQ Builder */}
                <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">FAQ Entries</h2>
                      <p className="text-gray-500 text-sm mt-1">{faqs.length} question{faqs.length !== 1 ? "s" : ""} added</p>
                    </div>
                    <div className="flex gap-2">
                      <input ref={csvRef} type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
                      <button
                        onClick={() => csvRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a2e]/80 border border-purple-500/20 hover:border-purple-500/40 rounded-lg text-gray-400 hover:text-gray-200 text-xs font-medium transition-all"
                      >
                        <Upload size={13} /> Import CSV
                      </button>
                      <button
                        onClick={() => setShowAddFaq(true)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-xs font-medium transition-all"
                      >
                        <Plus size={13} /> Add FAQ
                      </button>
                    </div>
                  </div>

                  {/* Add new FAQ inline form */}
                  {showAddFaq && (
                    <div className="mb-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-3">
                      <input
                        autoFocus
                        value={newFaq.question}
                        onChange={(e) => setNewFaq((p) => ({ ...p, question: e.target.value }))}
                        placeholder="Question (e.g. What are your business hours?)"
                        className="w-full bg-black/30 border border-purple-500/15 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                      />
                      <textarea
                        value={newFaq.answer}
                        onChange={(e) => setNewFaq((p) => ({ ...p, answer: e.target.value }))}
                        placeholder="Answer"
                        rows={3}
                        className="w-full bg-black/30 border border-purple-500/15 text-white placeholder-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                      />
                      <div className="flex gap-2">
                        <button onClick={addFaq} disabled={!newFaq.question.trim() || !newFaq.answer.trim()}
                          className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs rounded-lg font-medium transition-all">
                          Add
                        </button>
                        <button onClick={() => { setShowAddFaq(false); setNewFaq({ question: "", answer: "" }); }}
                          className="px-4 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-lg transition-all">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FAQ list */}
                  {faqs.length === 0 ? (
                    <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-purple-500/10 rounded-xl">
                      No FAQ entries yet. Add questions and answers above, or import from CSV.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="border border-purple-500/10 rounded-xl overflow-hidden">
                          {/* Accordion header */}
                          <div
                            className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-purple-500/5 transition-colors"
                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                          >
                            {expandedFaq === idx ? (
                              <ChevronDown size={15} className="text-purple-400 flex-shrink-0" />
                            ) : (
                              <ChevronRight size={15} className="text-gray-600 flex-shrink-0" />
                            )}
                            <span className="flex-1 text-sm text-gray-200 truncate">{faq.question}</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmIdx(idx); }}
                              className="p-1 text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Expanded: editable answer */}
                          {expandedFaq === idx && (
                            <div className="px-4 pb-4 bg-black/10 space-y-2">
                              <input
                                value={faq.question}
                                onChange={(e) => updateFaq(idx, "question", e.target.value)}
                                className="w-full bg-black/20 border border-purple-500/15 text-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                              />
                              <textarea
                                value={faq.answer}
                                onChange={(e) => updateFaq(idx, "answer", e.target.value)}
                                rows={3}
                                className="w-full bg-black/20 border border-purple-500/15 text-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CSV format hint */}
                  <p className="text-gray-600 text-xs mt-4">
                    CSV format: two columns — <code className="text-purple-400">Question, Answer</code> (first row treated as header and skipped)
                  </p>
                </div>

                {/* Quick Reply Buttons */}
                <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-white">Quick Reply Buttons</h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Clickable buttons shown when the widget opens. Each button has a question (label) and a pre-written answer shown instantly — no AI call needed.
                    </p>
                  </div>

                  {/* Add form */}
                  <div className="space-y-2 mb-4 p-4 bg-purple-500/5 border border-purple-500/15 rounded-xl">
                    <input
                      value={newQuickReply.question || ""}
                      onChange={(e) => setNewQuickReply((p) => ({ ...p, question: e.target.value }))}
                      placeholder="Question (button label) — e.g. What are your business hours?"
                      className="w-full bg-black/30 border border-purple-500/15 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/40"
                    />
                    <textarea
                      value={newQuickReply.answer || ""}
                      onChange={(e) => setNewQuickReply((p) => ({ ...p, answer: e.target.value }))}
                      placeholder="Answer shown instantly when button is clicked — e.g. We are open Mon–Fri, 9am to 6pm."
                      rows={3}
                      className="w-full bg-black/30 border border-purple-500/15 text-white placeholder-gray-600 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500/40"
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
                    <div className="text-center py-6 text-gray-600 text-sm border border-dashed border-purple-500/10 rounded-xl">
                      No quick reply buttons yet. Add a question and answer above.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {quickReplies.map((qr, idx) => (
                        <div key={idx} className="border border-purple-500/10 rounded-xl overflow-hidden">
                          <div className="flex items-center gap-3 px-4 py-2.5 bg-black/10">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-200 font-medium truncate">{qr.question}</p>
                              {qr.answer && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">{qr.answer}</p>
                              )}
                            </div>
                            <button
                              onClick={() => setQuickReplies((p) => p.filter((_, i) => i !== idx))}
                              className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-gray-600 text-xs mt-3">
                    If an answer is provided, it's shown instantly. If left empty, the question is sent to the AI.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "embed" && (
              <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 space-y-5 hover:border-purple-500/20 transition-colors">
                <div>
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Code size={20} /> Embed Code
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    Paste this snippet before the closing <code className="text-purple-400">&lt;/body&gt;</code> tag on your website.
                  </p>
                </div>
                <div className="relative">
                  <pre className="bg-black border border-purple-500/10 rounded-xl p-4 overflow-x-auto text-xs text-gray-400 leading-relaxed whitespace-pre-wrap break-all">
                    {embedCode}
                  </pre>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 p-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/20 rounded-lg transition-colors"
                  >
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-purple-400" />}
                  </button>
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="text-white font-medium">Installation Steps</h3>
                  {[
                    "Copy the embed code above",
                    "Paste it before the closing </body> tag in your HTML",
                    "Save & deploy — the widget will appear automatically",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">{i + 1}</div>
                      <p className="text-gray-400 text-sm pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Preview — always visible */}
            <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">Live Preview</h2>
                  <p className="text-gray-400 text-sm mt-1">See exactly how your widget will look</p>
                </div>
                <button
                  onClick={() => setShowWidget(!showWidget)}
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg px-4 py-2 text-white transition-all hover:shadow-lg hover:shadow-purple-500/20"
                >
                  {showWidget ? <EyeOff size={18} /> : <Eye size={18} />}
                  {showWidget ? "Hide Widget" : "Preview Widget"}
                </button>
              </div>
              <div className="bg-[#0a0a0a] rounded-xl h-[600px] relative border border-purple-500/10 overflow-hidden flex items-center justify-center">
                <div className="text-center text-gray-600 pointer-events-none select-none">
                  <Code size={48} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm opacity-60">Your website content here</p>
                  <p className="text-xs mt-1 opacity-40">Click "Preview Widget" to test the chatbot</p>
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
                  />
                )}
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
    </DashboardLayout>
  );
}
