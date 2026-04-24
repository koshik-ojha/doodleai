import Razorpay from "razorpay";
import crypto from "crypto";

// Initialized lazily so dotenv.config() in server.js runs first
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

export const createOrder = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: "Amount must be at least 100 paise" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Razorpay env vars missing");
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const order = await getRazorpay().orders.create({
      amount: Math.round(amount),
      currency,
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({ order_id: order.id, amount: order.amount, currency: order.currency });
  } catch (err) {
    console.error("Razorpay create-order error:", err.error || err.message, err.statusCode);
    res.status(500).json({ error: err.error?.description || "Failed to create payment order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment fields" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment signature mismatch" });
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("Razorpay verify-payment error:", err.message);
    res.status(500).json({ error: "Payment verification failed" });
  }
};
