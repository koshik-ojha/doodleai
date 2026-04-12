"use client";

import { FileText, Send, HelpCircle } from "lucide-react";

const FORM_ITEMS = ["Fill out contact form", "Request a quote", "Schedule a consultation"];

export default function QuickReplies({ onSelect, primaryColor = "#7c3aed", faqs = [], quickReplies = [] }) {
  // Prefer manually configured FAQs; fall back to auto-generated quick replies
  const questions = faqs.length > 0
    ? faqs.map((f) => f.question)
    : quickReplies.map((qr) => (typeof qr === "string" ? qr : qr.question));

  return (
    <div className="space-y-4 p-4">
      <h3 style={{ color: primaryColor }} className="font-semibold">How can we help you?</h3>

      {/* Quick reply buttons */}
      {questions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 text-sm">
            <HelpCircle size={16} />
            <span>Common Questions</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {questions.map((question, i) => (
              <QuickButton key={i} label={question} primaryColor={primaryColor} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}

      {/* Contact / form actions — always shown */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-zinc-400 text-sm">
          <FileText size={16} />
          <span>Contact Us</span>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {FORM_ITEMS.map((item, i) => (
            <QuickButton key={i} label={item} primaryColor={primaryColor} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickButton({ label, primaryColor, onSelect }) {
  return (
    <button
      onClick={() => onSelect(label)}
      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = primaryColor;
        e.currentTarget.style.color = "#fff";
        e.currentTarget.querySelector("svg").style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `${primaryColor}15`;
        e.currentTarget.style.color = primaryColor;
        e.currentTarget.querySelector("svg").style.color = primaryColor;
      }}
      className="text-left rounded-lg px-4 py-3 text-sm transition-colors flex items-center justify-between"
    >
      <span>{label}</span>
      <Send size={14} style={{ color: primaryColor }} className="transition-colors" />
    </button>
  );
}
