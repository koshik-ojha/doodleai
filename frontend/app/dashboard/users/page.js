"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { Search } from "lucide-react";
import { Input } from "@components/ui";
import api from "@lib/api";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    api.get("/users")
      .then(({ data }) => setUsers(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date) => new Date(date).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric"
  });

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Users</h1>
          <p className="text-gray-400 mt-1">View and manage all registered users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
            <p className="text-gray-400 text-xs font-semibold tracking-wider">TOTAL USERS</p>
            <p className="text-4xl font-bold text-white mt-3">{loading ? "..." : users.length}</p>
          </div>
          <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
            <p className="text-gray-400 text-xs font-semibold tracking-wider">TOTAL CHATS</p>
            <p className="text-4xl font-bold text-purple-400 mt-3">
              {loading ? "..." : users.reduce((sum, u) => sum + u.chats, 0)}
            </p>
          </div>
          <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:bg-[#1a1a2e]/70 hover:border-purple-500/20 transition-all">
            <p className="text-gray-400 text-xs font-semibold tracking-wider">AVG CHATS / USER</p>
            <p className="text-4xl font-bold text-cyan-400 mt-3">
              {loading || users.length === 0 ? "..." : (users.reduce((sum, u) => sum + u.chats, 0) / users.length).toFixed(1)}
            </p>
          </div>
        </div>

        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />

        <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl overflow-hidden hover:border-purple-500/20 transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-500/5 border-b border-purple-500/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Chats</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={4} className="px-6 py-4">
                        <div className="h-5 bg-purple-500/10 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-purple-500/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-400 font-semibold text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">{user.chats}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{timeAgo(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
