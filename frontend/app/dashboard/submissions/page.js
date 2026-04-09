"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { Search, Mail, Phone, Building, Calendar, Eye, Trash2, Bot } from "lucide-react";
import { Input, ConfirmModal } from "@components/ui";
import api from "@lib/api";

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    api.get("/submissions")
      .then(({ data }) => setSubmissions(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = submissions.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.company || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      const { data } = await api.patch(`/submissions/${id}/status`, { status });
      setSubmissions((prev) => prev.map((s) => s._id === id ? data : s));
      if (selectedSubmission?._id === id) setSelectedSubmission(data);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/submissions/${confirmId}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== confirmId));
      if (selectedSubmission?._id === confirmId) setSelectedSubmission(null);
    } catch (e) {
      console.error(e);
    } finally {
      setConfirmId(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return "bg-blue-500/10 text-blue-500";
      case "reviewed": return "bg-yellow-500/10 text-yellow-500";
      case "contacted": return "bg-green-500/10 text-green-500";
      default: return "bg-zinc-500/10 text-zinc-500";
    }
  };

  const getFormTypeBadge = (type) => {
    switch (type) {
      case "quote": return { label: "Quote Request", cls: "bg-purple-500/10 text-purple-400" };
      case "consultation": return { label: "Consultation", cls: "bg-emerald-500/10 text-emerald-400" };
      default: return { label: "Contact Form", cls: "bg-blue-500/10 text-blue-400" };
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Form Submissions</h1>
          <p className="text-gray-400 mt-1">Review and manage user form submissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
            <p className="text-gray-400 text-xs font-semibold tracking-wider">TOTAL SUBMISSIONS</p>
            <p className="text-4xl font-bold text-white mt-3">{loading ? "..." : submissions.length}</p>
          </div>
          <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
            <p className="text-gray-400 text-xs font-semibold tracking-wider">NEW</p>
            <p className="text-4xl font-bold text-purple-400 mt-3">
              {loading ? "..." : submissions.filter((s) => s.status === "new").length}
            </p>
          </div>
          <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
            <p className="text-gray-400 text-xs font-semibold tracking-wider">CONTACTED</p>
            <p className="text-4xl font-bold text-green-400 mt-3">
              {loading ? "..." : submissions.filter((s) => s.status === "contacted").length}
            </p>
          </div>
        </div>

        <Input
          placeholder="Search submissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map((i) => <div key={i} className="h-52 bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((sub) => (
              <div key={sub._id} className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{sub.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getFormTypeBadge(sub.formType).cls}`}>
                        {getFormTypeBadge(sub.formType).label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">{sub.email}</span>
                  </div>
                  {sub.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300">{sub.phone}</span>
                    </div>
                  )}
                  {sub.company && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300">{sub.company}</span>
                    </div>
                  )}
                  {sub.botName && (
                    <div className="flex items-center gap-2 text-sm">
                      <Bot size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="text-gray-300 truncate">{sub.botName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-300">{formatDate(sub.createdAt)}</span>
                  </div>
                </div>

                <div className="bg-gray-800/30 border border-gray-700/30 rounded-lg p-3 mb-4">
                  <p className="text-gray-300 text-sm line-clamp-2">{sub.message}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSubmission(sub)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg py-2 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <Eye size={14} /> View
                  </button>
                  <button
                    onClick={() => setConfirmId(sub._id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No submissions found</p>
          </div>
        )}
      </div>

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e]/95 border border-purple-500/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedSubmission.name}</h2>
                <p className="text-gray-400 mt-1">{selectedSubmission.subject}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-800/50 rounded-lg text-gray-400 hover:text-white transition-colors">✕</button>
            </div>

            <div className="space-y-4">
              {/* Form type badge */}
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFormTypeBadge(selectedSubmission.formType).cls}`}>
                  {getFormTypeBadge(selectedSubmission.formType).label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>

              {/* Common fields */}
              {[
                { label: "Email", value: selectedSubmission.email },
                { label: "Phone", value: selectedSubmission.phone || "—" },
                { label: "Company", value: selectedSubmission.company || "—" },
                ...(selectedSubmission.botName ? [{ label: "Chatbot", value: selectedSubmission.botName }] : []),
                { label: "Submitted At", value: formatDate(selectedSubmission.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-400 text-sm">{label}</p>
                  <p className="text-white mt-1">{value}</p>
                </div>
              ))}

              {/* Contact form fields */}
              {selectedSubmission.formType === "contact" && selectedSubmission.subject && (
                <div>
                  <p className="text-gray-400 text-sm">Subject</p>
                  <p className="text-white mt-1">{selectedSubmission.subject}</p>
                </div>
              )}

              {/* Quote-specific fields */}
              {selectedSubmission.formType === "quote" && selectedSubmission.budget && (
                <div>
                  <p className="text-gray-400 text-sm">Budget Range</p>
                  <p className="text-white mt-1">{selectedSubmission.budget}</p>
                </div>
              )}

              {/* Consultation-specific fields */}
              {selectedSubmission.formType === "consultation" && (
                <>
                  {selectedSubmission.topic && (
                    <div>
                      <p className="text-gray-400 text-sm">Topic</p>
                      <p className="text-white mt-1">{selectedSubmission.topic}</p>
                    </div>
                  )}
                  {selectedSubmission.preferredDate && (
                    <div>
                      <p className="text-gray-400 text-sm">Preferred Date</p>
                      <p className="text-white mt-1">{selectedSubmission.preferredDate}</p>
                    </div>
                  )}
                  {selectedSubmission.preferredTime && (
                    <div>
                      <p className="text-gray-400 text-sm">Preferred Time</p>
                      <p className="text-white mt-1">{selectedSubmission.preferredTime}</p>
                    </div>
                  )}
                </>
              )}

              {/* Message */}
              {selectedSubmission.message && (
                <div>
                  <p className="text-gray-400 text-sm">
                    {selectedSubmission.formType === "quote" ? "Project Description" : "Message"}
                  </p>
                  <p className="text-white mt-2 bg-gray-800/30 border border-gray-700/30 rounded-lg p-4 whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  disabled={updating === selectedSubmission._id || selectedSubmission.status === "contacted"}
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "contacted")}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 disabled:opacity-50 rounded-lg py-3 text-white font-medium shadow-lg shadow-green-500/20 transition-all"
                >
                  {updating === selectedSubmission._id ? "Updating..." : "Mark as Contacted"}
                </button>
                <button
                  disabled={updating === selectedSubmission._id || selectedSubmission.status === "reviewed"}
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "reviewed")}
                  className="flex-1 bg-gray-800/50 hover:bg-gray-800 disabled:opacity-50 border border-gray-700/50 rounded-lg py-3 text-white font-medium transition-all"
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmId}
        title="Delete submission?"
        message="This will permanently remove this form submission."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />
    </DashboardLayout>
  );
}
