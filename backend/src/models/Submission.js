import mongoose from "mongoose";


const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  company: { type: String, default: "" },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["new", "reviewed", "contacted"], default: "new" },
  formType: { type: String, enum: ["contact", "quote", "consultation"], default: "contact" },
  // Quote-specific
  budget: { type: String, default: "" },
  // Consultation-specific
  preferredDate: { type: String, default: "" },
  preferredTime: { type: String, default: "" },
  topic: { type: String, default: "" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  botId: { type: mongoose.Schema.Types.ObjectId, ref: "Chatbot" },
  botName: { type: String, default: "" },
}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);
