"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { Search, Mail, Phone, Building, Calendar, Eye, Trash2, Bot, Loader2, FileText } from "lucide-react";
import { Input, ConfirmModal } from "@components/ui";
import api from "@lib/api";

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState({ total: 0, newCount: 0, contacted: 0 });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setIsAdmin(user.role === "admin");
    } catch {}
    fetchPage(1, true);
  }, []);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get(`/submissions?page=${pageNum}&limit=15`);
      const list = reset ? data.submissions : [...submissions, ...data.submissions];
      setSubmissions(reset ? data.submissions : (prev) => [...prev, ...data.submissions]);
      setHasMore(data.hasMore);
      setPage(pageNum);
      if (reset) {
        // stats from first page total
        setStats({ total: data.total });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchPage(page + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPage]);

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
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "new": return "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "reviewed": return "bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "contacted": return "bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400";
      default: return "bg-gray-100 dark:bg-zinc-500/10 text-gray-700 dark:text-zinc-400";
    }
  };

  const getFormTypeBadge = (type) => {
    switch (type) {
      case "quote": return { label: "Quote Request", cls: "bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400" };
      case "consultation": return { label: "Consultation", cls: "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" };
      default: return { label: "Contact Form", cls: "bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400" };
    }
  };

  const filtered = submissions.filter((s) =>
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.company || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Admin: group by userId
  const grouped = isAdmin
    ? Object.entries(
        filtered.reduce((acc, sub) => {
          const uid = sub.userId?._id || "unknown";
          if (!acc[uid]) acc[uid] = { user: sub.userId, subs: [] };
          acc[uid].subs.push(sub);
          return acc;
        }, {})
      )
    : [];

  const newCount = submissions.filter((s) => s.status === "new").length;
  const contactedCount = submissions.filter((s) => s.status === "contacted").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Form Submissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin ? "All form submissions across all users" : "Review and manage user form submissions"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 hover:border-gray-300 dark:hover:border-purple-500/20 transition-all">
            <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold tracking-wider">TOTAL SUBMISSIONS</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-3">{loading ? "..." : stats.total ?? submissions.length}</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 hover:border-gray-300 dark:hover:border-purple-500/20 transition-all">
            <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold tracking-wider">NEW</p>
            <p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mt-3">{loading ? "..." : newCount}</p>
          </div>
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-6 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 hover:border-gray-300 dark:hover:border-purple-500/20 transition-all">
            <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold tracking-wider">CONTACTED</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-3">{loading ? "..." : contactedCount}</p>
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
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
              <FileText size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">No submissions found</p>
          </div>
        ) : isAdmin ? (
          // ── Admin: grouped by user ──
          <div className="space-y-8">
            {grouped.map(([uid, { user, subs }]) => (
              <div key={uid}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <span className="text-gray-900 dark:text-white font-semibold text-sm">{user?.name || "Unknown"}</span>
                  <span className="text-gray-600 dark:text-gray-500 text-xs">({user?.email || "—"})</span>
                  <span className="ml-auto text-gray-500 dark:text-gray-600 text-xs">{subs.length} submission{subs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subs.map((sub) => (
                    <SubCard
                      key={sub._id}
                      sub={sub}
                      getFormTypeBadge={getFormTypeBadge}
                      getStatusColor={getStatusColor}
                      formatDate={formatDate}
                      onView={() => setSelectedSubmission(sub)}
                      onDelete={() => setConfirmId(sub._id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ── Regular user: flat grid ──
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((sub) => (
              <SubCard
                key={sub._id}
                sub={sub}
                getFormTypeBadge={getFormTypeBadge}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                onView={() => setSelectedSubmission(sub)}
                onDelete={() => setConfirmId(sub._id)}
              />
            ))}
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="text-purple-400 animate-spin" />
          </div>
        )}

        {!hasMore && submissions.length > 0 && (
          <p className="text-center text-gray-500 dark:text-gray-700 text-xs py-2">All submissions loaded</p>
        )}
      </div>

      {/* Detail modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#1a1a2e]/95 border border-gray-200 dark:border-purple-500/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSubmission.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedSubmission.subject}</p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800/50 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getFormTypeBadge(selectedSubmission.formType).cls}`}>
                  {getFormTypeBadge(selectedSubmission.formType).label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>

              {[
                { label: "Email", value: selectedSubmission.email },
                { label: "Phone", value: selectedSubmission.phone || "—" },
                { label: "Company", value: selectedSubmission.company || "—" },
                ...(selectedSubmission.botName ? [{ label: "Chatbot", value: selectedSubmission.botName }] : []),
                ...(isAdmin && selectedSubmission.userId ? [{ label: "Owner", value: `${selectedSubmission.userId.name} (${selectedSubmission.userId.email})` }] : []),
                { label: "Submitted At", value: formatDate(selectedSubmission.createdAt) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
                  <p className="text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
              ))}

              {selectedSubmission.formType === "contact" && selectedSubmission.subject && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Subject</p>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedSubmission.subject}</p>
                </div>
              )}
              {selectedSubmission.formType === "quote" && selectedSubmission.budget && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Budget Range</p>
                  <p className="text-gray-900 dark:text-white mt-1">{selectedSubmission.budget}</p>
                </div>
              )}
              {selectedSubmission.formType === "consultation" && (
                <>
                  {selectedSubmission.topic && <div><p className="text-gray-600 dark:text-gray-400 text-sm">Topic</p><p className="text-gray-900 dark:text-white mt-1">{selectedSubmission.topic}</p></div>}
                  {selectedSubmission.preferredDate && <div><p className="text-gray-600 dark:text-gray-400 text-sm">Preferred Date</p><p className="text-gray-900 dark:text-white mt-1">{selectedSubmission.preferredDate}</p></div>}
                  {selectedSubmission.preferredTime && <div><p className="text-gray-600 dark:text-gray-400 text-sm">Preferred Time</p><p className="text-gray-900 dark:text-white mt-1">{selectedSubmission.preferredTime}</p></div>}
                </>
              )}
              {selectedSubmission.message && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedSubmission.formType === "quote" ? "Project Description" : "Message"}</p>
                  <p className="text-gray-900 dark:text-white mt-2 bg-gray-100 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30 rounded-lg p-4 whitespace-pre-wrap">{selectedSubmission.message}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  disabled={updating === selectedSubmission._id || selectedSubmission.status === "contacted"}
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "contacted")}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg py-2 disabled:opacity-50 text-white font-medium transition-all"
                >
                  {updating === selectedSubmission._id ? "Updating..." : "Mark as Contacted"}
                </button>
                <button
                  disabled={updating === selectedSubmission._id || selectedSubmission.status === "reviewed"}
                  onClick={() => handleStatusUpdate(selectedSubmission._id, "reviewed")}
                  className="flex-1 bg-gray-200 dark:bg-gray-800/50 hover:bg-gray-300 dark:hover:bg-gray-800 disabled:opacity-50 border border-gray-300 dark:border-gray-700/50 rounded-lg py-2 text-gray-900 dark:text-white font-medium transition-all"
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

function SubCard({ sub, getFormTypeBadge, getStatusColor, formatDate, onView, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl p-5 hover:bg-gray-50 dark:hover:bg-[#1a1a2e]/70 hover:border-gray-300 dark:hover:border-purple-500/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{sub.name}</h3>
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

      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Mail size={11} className="flex-shrink-0" />
          <span className="truncate">{sub.email}</span>
        </div>
        {sub.phone && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Phone size={11} className="flex-shrink-0" />
            <span>{sub.phone}</span>
          </div>
        )}
        {sub.company && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Building size={11} className="flex-shrink-0" />
            <span>{sub.company}</span>
          </div>
        )}
        {sub.botName && (
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Bot size={11} className="flex-shrink-0" />
            <span className="truncate">{sub.botName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
          <Calendar size={11} className="flex-shrink-0" />
          <span>{formatDate(sub.createdAt)}</span>
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30 rounded-lg p-3 mb-4">
        <p className="text-gray-700 dark:text-gray-300 text-xs line-clamp-2">{sub.message}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onView}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 rounded-lg py-2 text-white text-xs font-medium transition-all"
        >
          <Eye size={13} /> View
        </button>
        <button
          onClick={onDelete}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

