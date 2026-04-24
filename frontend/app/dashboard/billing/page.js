"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@components/DashboardLayout";
import { ConfirmModal } from "@components/ui";
import {
  Check, Zap, Crown, Star, AlertTriangle, Calendar,
  RefreshCw, XCircle, CheckCircle, Loader2, CreditCard,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import api from "@lib/api";
import toast from "react-hot-toast";

// ── Plan definitions (mirrors backend config/plans.js) ──────────────────────
const PLAN_META = {
  starter:      { label: "Starter",      icon: Zap,    features: ["1 Chatbot", "AI-Powered Responses", "Basic Analytics", "Email Support"] },
  growth:       { label: "Growth",       icon: Crown,  features: ["3 Chatbots", "Advanced AI Features", "Advanced Analytics", "Priority Support", "Custom Branding"], popular: true },
  professional: { label: "Professional", icon: Star,   features: ["5 Chatbots", "Premium AI Features", "Full Analytics Suite", "24/7 Priority Support", "White Label Option"] },
};

const MONTHLY_PLANS = [
  { planKey: "starter",      billing: "monthly", display: "₹500",    amount: 50000,   chatbotLimit: 1 },
  { planKey: "growth",       billing: "monthly", display: "₹1,200",  amount: 120000,  chatbotLimit: 3 },
  { planKey: "professional", billing: "monthly", display: "₹2,000",  amount: 200000,  chatbotLimit: 5 },
];

const YEARLY_PLANS = [
  { planKey: "starter",      billing: "yearly",  display: "₹5,500",  amount: 550000,  chatbotLimit: 1 },
  { planKey: "growth",       billing: "yearly",  display: "₹12,000", amount: 1200000, chatbotLimit: 3 },
  { planKey: "professional", billing: "yearly",  display: "₹20,000", amount: 2000000, chatbotLimit: 5 },
];

const STATUS_CONFIG = {
  active:         { color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", label: "Active" },
  authenticated:  { color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-500/10",    label: "Processing" },
  created:        { color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-500/10",    label: "Pending" },
  cancelled:      { color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-500/10",   label: "Cancelled" },
  halted:         { color: "text-red-600 dark:text-red-400",        bg: "bg-red-500/10",     label: "Halted" },
  completed:      { color: "text-gray-600 dark:text-gray-400",      bg: "bg-gray-500/10",    label: "Completed" },
  expired:        { color: "text-gray-600 dark:text-gray-400",      bg: "bg-gray-500/10",    label: "Expired" },
};

const fmt = (date) => date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ── Current plan status card ─────────────────────────────────────────────────
function SubscriptionStatus({ sub, onCancel }) {
  // "created" = user opened checkout but never paid — hide card, show plans instead
  if (!sub || ["expired", "completed", "created"].includes(sub.status)) return null;

  const cfg = STATUS_CONFIG[sub.status] || STATUS_CONFIG.expired;
  const meta = PLAN_META[sub.planKey];
  const Icon = meta?.icon || CreditCard;
  const isCancelled = sub.status === "cancelled";
  const isPending = ["created", "authenticated"].includes(sub.status);

  return (
    <div className={`relative bg-white dark:bg-[#1a1a2e]/50 border rounded-2xl p-6 mb-6 ${
      isCancelled ? "border-amber-500/30" : "border-violet-500/20"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
            <Icon size={22} className="text-violet-500" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Current Plan</p>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {meta?.label || sub.planKey} — {sub.billing === "monthly" ? "Monthly" : "Yearly"}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              {isPending && <span className="text-xs text-gray-500">Awaiting payment confirmation</span>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:text-right text-sm">
          {sub.nextBillingDate && !isCancelled && (
            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
              <Calendar size={14} />
              <span>Next billing: <strong>{fmt(sub.nextBillingDate)}</strong></span>
            </div>
          )}
          {isCancelled && sub.suspensionDate && (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle size={14} />
              <span>Active until <strong>{fmt(sub.suspensionDate)}</strong></span>
            </div>
          )}
          <span className="text-xs text-gray-500 dark:text-gray-400">{sub.chatbotLimit} chatbot(s) allowed</span>
        </div>
      </div>

      {/* Autopay section */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-purple-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isCancelled ? "bg-amber-500/10" : "bg-emerald-500/10"
            }`}>
              {isCancelled
                ? <ToggleLeft size={18} className="text-amber-500" />
                : <ToggleRight size={18} className="text-emerald-500" />
              }
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                Autopay
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isCancelled
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}>
                  {isCancelled ? "Disabled" : "Enabled"}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isCancelled
                  ? <>Access continues until <strong className="text-amber-600 dark:text-amber-400">{fmt(sub.suspensionDate)}</strong>, then suspended.</>
                  : "Your subscription renews automatically each billing period."
                }
              </p>
            </div>
          </div>

          {["active", "authenticated"].includes(sub.status) && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/5 hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
            >
              <XCircle size={15} />
              Disable Autopay
            </button>
          )}
        </div>

        {isCancelled && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
            Autopay is disabled. You won&apos;t be charged again. Subscribe to a plan below to re-enable autopay and continue after your current period ends.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function BillingPage() {
  const [billing, setBilling] = useState("monthly");
  const [sub, setSub] = useState(undefined); // undefined = loading
  const [subscribing, setSubscribing] = useState(null); // planKey being subscribed
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const suspendedReason = (() => {
    if (typeof window === "undefined") return null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u.trialExpired) return "trial";
      if (u.paymentSuspended) return "payment";
    } catch {}
    return null;
  })();

  const plans = billing === "monthly" ? MONTHLY_PLANS : YEARLY_PLANS;

  const fetchSub = useCallback(async () => {
    try {
      const { data } = await api.get("/subscriptions/me");
      setSub(data);
    } catch {
      setSub(null);
    }
  }, []);

  useEffect(() => { fetchSub(); }, [fetchSub]);

  const handleSubscribe = async (plan) => {
    setSubscribing(plan.planKey);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Could not load payment gateway"); return; }

      const { data } = await api.post("/subscriptions/create", {
        planKey: plan.planKey,
        billing: plan.billing,
      });

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const meta = PLAN_META[plan.planKey];

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscriptionId,
        name: "DoodleAI",
        description: `${meta.label} Plan — ${billing === "monthly" ? "Monthly" : "Yearly"}`,
        handler: async (response) => {
          try {
            await api.post("/subscriptions/verify", response);
            toast.success("Payment received! Your plan will activate within a few minutes.");
            fetchSub();
          } catch {
            // api interceptor shows error
          }
        },
        prefill: { name: user.name || "", email: user.email || "", method: "upi" },
        theme: { color: "#7c3aed" },
        modal: { ondismiss: () => toast("Payment cancelled") },
        config: {
          display: {
            hide: [{ method: "card" }],
            preferences: { show_default_blocks: true },
          },
        },
      };

      new window.Razorpay(options).open();
    } catch {
      // api interceptor shows error
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const { data } = await api.post("/subscriptions/cancel");
      toast.success("Autopay cancelled. Your account stays active until " + fmt(data.suspensionDate));
      setShowCancelModal(false);
      fetchSub();
    } catch {
      // api interceptor shows error
    } finally {
      setCancelling(false);
    }
  };

  const isActiveSub = sub && ["active", "authenticated"].includes(sub.status);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your subscription</p>
        </div>

        {/* Suspended banner — shown when redirected here after trial/payment expiry */}
        {suspendedReason && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">
                {suspendedReason === "trial" ? "Your free trial has ended" : "Your subscription has expired"}
              </p>
              <p className="text-amber-700 dark:text-amber-400">
                Please subscribe to a plan below to continue using DoodleAI.
              </p>
            </div>
          </div>
        )}

        {/* Current plan status */}
        {sub === undefined ? (
          <div className="h-28 bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl animate-pulse" />
        ) : (
          <SubscriptionStatus sub={sub} onCancel={() => setShowCancelModal(true)} />
        )}

        {/* Monthly / Yearly toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-violet-600 text-white shadow shadow-violet-500/30"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              billing === "yearly"
                ? "bg-violet-600 text-white shadow shadow-violet-500/30"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Yearly
            <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">Save ~8%</span>
          </button>
          <button onClick={fetchSub} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Refresh status">
            <RefreshCw size={14} />
          </button>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const meta = PLAN_META[plan.planKey];
            const Icon = meta.icon;
            const isCurrent = sub && sub.planKey === plan.planKey && sub.billing === plan.billing && isActiveSub;
            const isLoading = subscribing === plan.planKey;

            return (
              <div
                key={plan.planKey}
                className={`relative bg-white dark:bg-[#1a1a2e]/50 border rounded-2xl p-6 flex flex-col transition-all ${
                  meta.popular
                    ? "border-violet-500/40 shadow-lg shadow-violet-500/10"
                    : isCurrent
                    ? "border-emerald-500/40"
                    : "border-gray-200 dark:border-purple-500/10 hover:border-violet-500/30"
                }`}
              >
                {meta.popular && !isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow flex items-center gap-1">
                    <CheckCircle size={11} /> Current Plan
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Icon size={20} className="text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{meta.label}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.chatbotLimit} chatbot{plan.chatbotLimit > 1 ? "s" : ""}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.display}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">/{billing === "monthly" ? "mo" : "yr"}</span>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {meta.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <Check size={14} className="text-violet-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-lg text-sm font-medium text-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle size={14} className="inline mr-1.5" />
                    Active Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isLoading || subscribing !== null}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${
                      meta.popular
                        ? "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white hover:shadow-lg hover:shadow-violet-500/20"
                        : "bg-violet-100 dark:bg-violet-500/10 hover:bg-violet-200 dark:hover:bg-violet-500/20 border border-violet-300 dark:border-violet-500/20 text-violet-700 dark:text-white"
                    }`}
                  >
                    {isLoading ? <><Loader2 size={14} className="animate-spin" /> Processing...</> : `Subscribe — ${plan.display}`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          Autopay via Razorpay. Cancel anytime — your account stays active until the end of your billing period.
          In test mode use UPI ID <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">success@razorpay</code>.
        </p>
      </div>

      <ConfirmModal
        open={showCancelModal}
        title="Disable Autopay?"
        message={`Your plan stays active until ${fmt(sub?.currentEnd || sub?.suspensionDate)} — you won't lose access immediately. After that date your account will be suspended unless you subscribe again. You can re-subscribe at any time.`}
        confirmLabel={cancelling ? "Disabling..." : "Yes, Disable Autopay"}
        cancelLabel="Keep Autopay On"
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </DashboardLayout>
  );
}
