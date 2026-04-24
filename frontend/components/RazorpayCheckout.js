"use client";

import { useState } from "react";
import api from "@lib/api";
import toast from "react-hot-toast";

const loadCheckoutScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function RazorpayCheckout({ amount, planName, onSuccess, className = "", children }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const loaded = await loadCheckoutScript();
      if (!loaded) {
        toast.error("Could not load payment gateway. Check your connection.");
        return;
      }

      const { data } = await api.post("/payment/create-order", { amount });

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "DoodleAI",
        description: planName,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            await api.post("/payment/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            onSuccess?.({ paymentId: response.razorpay_payment_id, orderId: response.razorpay_order_id });
          } catch {
            // api interceptor already shows the error toast
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#7c3aed" },
        modal: {
          ondismiss: () => toast("Payment cancelled"),
        },
      };

      new window.Razorpay(options).open();
    } catch {
      // api interceptor already shows the error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
