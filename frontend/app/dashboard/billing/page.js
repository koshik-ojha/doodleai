"use client";

import { useState } from "react";
import DashboardLayout from "@components/DashboardLayout";
import RazorpayCheckout from "@components/RazorpayCheckout";
import { Check, Zap, Crown, Star, Trophy } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    icon: Zap,
    price: 50000,
    display: "₹500",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "1 Chatbot",
      "AI-Powered Responses",
      "Basic Analytics",
      "Email Support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    icon: Crown,
    price: 120000,
    display: "₹1,200",
    period: "/month",
    description: "For growing teams that need more power",
    features: [
      "3 Chatbots",
      "Advanced AI Features",
      "Advanced Analytics",
      "Priority Support",
      "Custom Branding",
    ],
    popular: true,
  },
  {
    id: "professional",
    name: "Professional",
    icon: Star,
    price: 200000,
    display: "₹2,000",
    period: "/month",
    description: "For professionals scaling their business",
    features: [
      "5 Chatbots",
      "Premium AI Features",
      "Full Analytics Suite",
      "24/7 Priority Support",
      "White Label Option",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Trophy,
    price: null,
    display: "Custom",
    period: "",
    description: "Tailored solutions for large organizations",
    features: [
      "5+ Chatbots",
      "Custom AI Training",
      "Dedicated Account Manager",
      "SLA Guarantee",
      "Custom Integration",
    ],
  },
];

export default function BillingPage() {
  const [paid, setPaid] = useState(null);

  const handleSuccess = (plan, paymentInfo) => {
    setPaid({ plan, ...paymentInfo });
  };

  if (paid) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
            <Check size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            You&apos;re now on the <span className="font-semibold text-violet-600 dark:text-violet-400">{paid.plan}</span> plan.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-8">Payment ID: {paid.paymentId}</p>
          <button
            onClick={() => setPaid(null)}
            className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white px-8 py-2.5 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-violet-500/20"
          >
            Back to Billing
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing & Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a plan that fits your needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-[#1a1a2e]/50 border rounded-2xl p-6 flex flex-col transition-colors hover:border-violet-500/30 ${
                  plan.popular
                    ? "border-violet-500/40 shadow-lg shadow-violet-500/10"
                    : "border-gray-200 dark:border-purple-500/10"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-violet-500 text-white text-xs font-semibold px-4 py-1 rounded-full shadow">
                    Most Popular
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Icon size={20} className="text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.display}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{plan.period}</span>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <Check size={15} className="text-violet-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {plan.price !== null ? (
                  <RazorpayCheckout
                    amount={plan.price}
                    planName={`DoodleAI ${plan.name} Plan`}
                    onSuccess={(info) => handleSuccess(plan.name, info)}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white hover:shadow-lg hover:shadow-violet-500/20"
                        : "bg-violet-100 dark:bg-violet-500/10 hover:bg-violet-200 dark:hover:bg-violet-500/20 border border-violet-300 dark:border-violet-500/20 text-violet-700 dark:text-white"
                    } disabled:opacity-60`}
                  >
                    Subscribe to {plan.name}
                  </RazorpayCheckout>
                ) : (
                  <button
                    onClick={() => alert("Please contact us at support@doodleai.com for Enterprise pricing")}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-all bg-violet-100 dark:bg-violet-500/10 hover:bg-violet-200 dark:hover:bg-violet-500/20 border border-violet-300 dark:border-violet-500/20 text-violet-700 dark:text-white"
                  >
                    Contact Us
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-500">
          Payments are processed securely via Razorpay. Test mode is active — use card{" "}
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">4111 1111 1111 1111</code>{" "}
          with any future expiry and CVV.
        </p>
      </div>
    </DashboardLayout>
  );
}
