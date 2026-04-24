"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { Loader2, Users } from "lucide-react";
import api from "@lib/api";

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [limitEdit, setLimitEdit] = useState({});
  const [forceEdit, setForceEdit] = useState({});
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (!token) { router.push("/"); return; }
    try {
      const parsed = JSON.parse(user || "{}");
      if (parsed.role !== "admin") { router.push("/dashboard"); return; }
    } catch {
      router.push("/dashboard");
      return;
    }
    fetchPage(1, true);
  }, []);

  const fetchPage = useCallback(async (pageNum, reset = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    try {
      const { data } = await api.get(`/admin/users?page=${pageNum}&limit=15`);
      setUsers((prev) => reset ? data.users : [...prev, ...data.users]);
      setTotal(data.total);
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch {
      // handled by api interceptor
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

  const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;
  const isTrialExpired = (u) =>
    !u.adminActivated && Date.now() > new Date(u.createdAt).getTime() + TRIAL_MS;

  const handleSuspend = async (userId) => {

    setActionLoading(userId + "-suspend");
    try {
      await api.patch(`/admin/users/${userId}/suspend`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isSuspended: true } : u));
    } catch (e) {
      alert(e.response?.data?.error || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async (userId) => {
    setActionLoading(userId + "-reactivate");
    try {
      await api.patch(`/admin/users/${userId}/reactivate`);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isSuspended: false } : u));
    } catch (e) {
      alert(e.response?.data?.error || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleIconPermission = async (userId, allow) => {
    setActionLoading(userId + "-icon");
    try {
      await api.patch(`/admin/users/${userId}/icon-permission`, { canChangeIcon: allow });
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, canChangeIcon: allow } : u));
    } catch (e) {
      alert(e.response?.data?.error || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLimitSave = async (userId, currentMaxChatbots, currentForce) => {
    const val = limitEdit[userId] !== undefined ? parseInt(limitEdit[userId]) : currentMaxChatbots;
    if (isNaN(val) || val < 0) return;
    const force = forceEdit[userId] !== undefined ? forceEdit[userId] : currentForce;
    setActionLoading(userId + "-limit");
    try {
      const { data } = await api.patch(`/admin/users/${userId}/chatbot-limit`, {
        maxChatbots: val,
        forceAllocatedChatbots: force,
      });
      setUsers((prev) => prev.map((u) =>
        u._id === userId
          ? { ...u, maxChatbots: data.user.maxChatbots, forceAllocatedChatbots: data.user.forceAllocatedChatbots }
          : u
      ));
      setLimitEdit((prev) => { const next = { ...prev }; delete next[userId]; return next; });
      setForceEdit((prev) => { const next = { ...prev }; delete next[userId]; return next; });
    } catch (e) {
      alert(e.response?.data?.error || "Failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className=" space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {loading ? "Loading..." : `${total} registered user${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center">
            <Users size={20} className="text-violet-600 dark:text-violet-400" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 border border-gray-200 dark:border-purple-500/10 rounded-2xl bg-gray-50 dark:bg-[#1a1a2e]/30">
            <Users size={28} className="text-gray-500 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#1a1a2e]/50 border border-gray-200 dark:border-purple-500/10 rounded-2xl overflow-hidden">
            {/* Table head */}
            <table className="w-full border-collapse">
              {/* Header */}
              <thead>
                <tr className="text-xs font-semibold text-gray-600 dark:text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-purple-500/10">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Joined</th>
                  <th className="text-left px-5 py-3">Chatbot Limit / Force</th>
                  <th className="text-left px-5 py-3">Custom Icon</th>
                  <th className="text-left px-5 py-3">Action</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-gray-200 dark:divide-purple-500/10">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="hover:bg-gray-50 dark:hover:bg-purple-500/5 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold flex-shrink-0">
                          {u.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 dark:text-white text-sm font-medium truncate">
                            {u.name}
                          </p>
                          {u.company && (
                            <p className="text-gray-500 dark:text-gray-600 text-xs truncate">
                              {u.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 text-sm truncate max-w-[200px]">
                      {u.email}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-500 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Chatbot Limit */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={limitEdit[u._id] !== undefined ? limitEdit[u._id] : (u.maxChatbots ?? 1)}
                            onChange={(e) => setLimitEdit((prev) => ({ ...prev, [u._id]: e.target.value }))}
                            className="w-16 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-purple-500/20 text-gray-900 dark:text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                          />
                          {(limitEdit[u._id] !== undefined && String(limitEdit[u._id]) !== String(u.maxChatbots ?? 1)) ||
                           (forceEdit[u._id] !== undefined && forceEdit[u._id] !== !!u.forceAllocatedChatbots) ? (
                            <button
                              onClick={() => handleLimitSave(u._id, u.maxChatbots ?? 1, !!u.forceAllocatedChatbots)}
                              disabled={actionLoading === u._id + "-limit"}
                              className="px-2 py-1 text-xs rounded-lg bg-purple-700/20 text-purple-400 hover:bg-purple-700/40 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === u._id + "-limit" ? "..." : "Save"}
                            </button>
                          ) : null}
                        </div>
                        {/* Force allocate toggle */}
                        <label className="flex items-center gap-1.5 cursor-pointer select-none w-fit">
                          <input
                            type="checkbox"
                            checked={forceEdit[u._id] !== undefined ? forceEdit[u._id] : !!u.forceAllocatedChatbots}
                            onChange={(e) => setForceEdit((prev) => ({ ...prev, [u._id]: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded accent-purple-600 cursor-pointer"
                          />
                          <span className="text-xs text-gray-500 dark:text-gray-400">Force allocate</span>
                        </label>
                      </div>
                    </td>

                    {/* Custom Icon Permission */}
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleIconPermission(u._id, !u.canChangeIcon)}
                        disabled={actionLoading === u._id + "-icon"}
                        title={u.canChangeIcon ? "Disallow custom icon" : "Allow custom icon"}
                        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                          u.canChangeIcon ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          u.canChangeIcon ? "translate-x-4" : "translate-x-0"
                        }`} />
                      </button>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.isSuspended
                              ? "bg-red-900/40 text-red-400"
                              : isTrialExpired(u)
                              ? "bg-orange-900/40 text-orange-400"
                              : "bg-green-900/40 text-green-400"
                          }`}
                        >
                          {u.isSuspended ? "Suspended" : isTrialExpired(u) ? "Trial Expired" : "Active"}
                        </span>

                        {(u.isSuspended || isTrialExpired(u)) ? (
                          <button
                            onClick={() => handleReactivate(u._id)}
                            disabled={!!actionLoading}
                            className="px-3 py-1 text-xs rounded-lg bg-green-700/20 text-green-400 hover:bg-green-700/40 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === u._id + "-reactivate" ? "..." : "Activate"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(u._id)}
                            disabled={!!actionLoading}
                            className="px-3 py-1 text-xs rounded-lg bg-red-700/20 text-red-400 hover:bg-red-700/40 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === u._id + "-suspend" ? "..." : "Suspend"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-4" />

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 size={20} className="text-purple-400 animate-spin" />
          </div>
        )}

        {!hasMore && users.length > 0 && (
          <p className="text-center text-gray-700 text-xs py-2">All users loaded</p>
        )}
      </div>
    </DashboardLayout>
  );
}

