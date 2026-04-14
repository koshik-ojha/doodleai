"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { Input, Select, Textarea } from "@components/ui";
import showToast from "@utils/toast";

const FORM_CONFIG = {
  contact:      { title: "Contact Us",              submitLabel: "Send Message" },
  quote:        { title: "Request a Quote",          submitLabel: "Request Quote" },
  consultation: { title: "Schedule a Consultation", submitLabel: "Book Consultation" },
};

const BUDGET_OPTIONS = [
  { value: "",               label: "Budget range" },
  { value: "Under $1,000",   label: "Under $1,000" },
  { value: "$1,000–$5,000",  label: "$1,000 – $5,000" },
  { value: "$5,000–$10,000", label: "$5,000 – $10,000" },
  { value: "$10,000–$25,000",label: "$10,000 – $25,000" },
  { value: "$25,000+",       label: "$25,000+" },
];

const TIME_OPTIONS = [
  { value: "",                    label: "Preferred time slot" },
  { value: "9:00 AM – 11:00 AM",  label: "9:00 AM – 11:00 AM" },
  { value: "11:00 AM – 1:00 PM",  label: "11:00 AM – 1:00 PM" },
  { value: "1:00 PM – 3:00 PM",   label: "1:00 PM – 3:00 PM" },
  { value: "3:00 PM – 5:00 PM",   label: "3:00 PM – 5:00 PM" },
];

// Consistent height override for all single-line fields
const h = "!py-2 !text-sm";

const buildWhatsAppMessage = (formType, formData) => {
  const lines = [];
  const titles = { contact: "Contact Form", quote: "Quote Request", consultation: "Consultation Request" };
  lines.push(`*New ${titles[formType] || "Form Submission"}*`);
  lines.push(`Name: ${formData.name}`);
  lines.push(`Email: ${formData.email}`);
  if (formData.phone)   lines.push(`Phone: ${formData.phone}`);
  if (formData.company) lines.push(`Company: ${formData.company}`);
  if (formType === "contact") {
    if (formData.subject) lines.push(`Subject: ${formData.subject}`);
    if (formData.message) lines.push(`Message: ${formData.message}`);
  }
  if (formType === "quote") {
    if (formData.message) lines.push(`Project: ${formData.message}`);
    if (formData.budget)  lines.push(`Budget: ${formData.budget}`);
  }
  if (formType === "consultation") {
    if (formData.topic)         lines.push(`Topic: ${formData.topic}`);
    if (formData.message)       lines.push(`Details: ${formData.message}`);
    if (formData.preferredDate) lines.push(`Date: ${formData.preferredDate}`);
    if (formData.preferredTime) lines.push(`Time: ${formData.preferredTime}`);
  }
  return lines.join("\n");
};

export default function ChatbotForm({ onSubmit, onClose, formType = "contact", primaryColor = "#7c3aed", whatsappNumber = "" }) {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", company: "",
    subject: "", message: "",
    budget: "", preferredDate: "", preferredTime: "", topic: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const set = (f) => (e) => setFormData((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      if (onSubmit) onSubmit(formData);
      
      if (whatsappNumber) {
        const msg = buildWhatsAppMessage(formType, formData);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
      }
      
      setSubmitted(true);
      showToast.success("Form submitted successfully!");
      
      setTimeout(() => { 
        if (onClose) onClose(); 
      }, 2000);
    } catch (error) {
      showToast.error("Failed to submit form. Please try again.");
      console.error("Form submission error:", error);
    }
  };

  const cfg = FORM_CONFIG[formType] || FORM_CONFIG.contact;

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
          <Check size={20} className="text-emerald-500" />
        </div>
        <p className="text-sm font-semibold text-gray-800">Thank You!</p>
        <p className="text-xs text-gray-500 mt-1">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3 h-full">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-gray-800">{cfg.title}</p>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
            <X size={14} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">

        {/* ── Common fields ── */}
        <Input variant="light" className={h} placeholder="Full name *" required value={formData.name} onChange={set("name")} />
        <Input variant="light" className={h} placeholder="Email address *" type="email" required value={formData.email} onChange={set("email")} />
        <Input variant="light" className={h} placeholder="Phone number" type="tel" value={formData.phone} onChange={set("phone")} />

        {/* ── Contact ── */}
        {formType === "contact" && (
          <>
            <Input    variant="light" className={h}  placeholder="Company"  value={formData.company} onChange={set("company")} />
            <Input    variant="light" className={h}  placeholder="Subject"  value={formData.subject} onChange={set("subject")} />
            <Textarea variant="light" className="!text-sm" rows={3} placeholder="Message *" required value={formData.message} onChange={set("message")} />
          </>
        )}

        {/* ── Quote ── */}
        {formType === "quote" && (
          <>
            <Input    variant="light" className={h} placeholder="Company" value={formData.company} onChange={set("company")} />
            <Textarea variant="light" className="!text-sm" rows={3} placeholder="Describe your project *" required value={formData.message} onChange={set("message")} />
            <Select   variant="light" className={h} value={formData.budget} onChange={set("budget")} options={BUDGET_OPTIONS} />
          </>
        )}

        {/* ── Consultation ── */}
        {formType === "consultation" && (
          <>
            <Input    variant="light" className={h} placeholder="Topic / what to discuss *" required value={formData.topic} onChange={set("topic")} />
            <Textarea variant="light" className="!text-sm" rows={2} placeholder="Additional details" value={formData.message} onChange={set("message")} />
            {/* <Input    variant="light" className={h} type="date" required value={formData.preferredDate} onChange={set("preferredDate")} min={new Date().toISOString().split("T")[0]} /> */}
            {/* <Select   variant="light" className={h} value={formData.preferredTime} onChange={set("preferredTime")} options={TIME_OPTIONS} /> */}
          </>
        )}

        <button
          type="submit"
          style={{ backgroundColor: primaryColor }}
          className="w-full h-9 rounded-lg text-white text-xs font-semibold transition-all hover:opacity-90"
        >
          {cfg.submitLabel}
        </button>
      </form>
    </div>
  );
}

