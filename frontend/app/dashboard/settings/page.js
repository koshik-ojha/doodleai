"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@components/DashboardLayout";
import { User, Bell, Globe, Shield, Check, Eye, EyeOff } from "lucide-react";
import { Input, Select, Textarea, Toggle } from "@components/ui";
import api from "@lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [profile, setProfile] = useState({ name: "", email: "", company: "" });
  const [settings, setSettings] = useState({
    botName: "", welcomeMessage: "", responseDelay: "instant", language: "english",
    emailNotifications: true, chatAlerts: true, weeklyReports: false, sessionTimeout: "30",
  });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [showPw, setShowPw] = useState({ current: false, new: false });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/"); return; }

    Promise.all([api.get("/auth/profile"), api.get("/settings")])
      .then(([{ data: user }, { data: s }]) => {
        setProfile({ name: user.name, email: user.email, company: user.company || "" });
        setSettings({
          botName: s.botName, welcomeMessage: s.welcomeMessage,
          responseDelay: s.responseDelay, language: s.language,
          emailNotifications: s.emailNotifications, chatAlerts: s.chatAlerts,
          weeklyReports: s.weeklyReports, sessionTimeout: s.sessionTimeout,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/auth/profile", profile);
      localStorage.setItem("user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("token", data.token);
      showToast("Profile updated successfully");
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to update profile", "error");
    } finally { setSaving(false); }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await api.put("/settings", settings);
      showToast("Settings saved successfully");
    } catch {
      showToast("Failed to save settings", "error");
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirm)
      return showToast("New passwords do not match", "error");
    if (passwords.newPassword.length < 6)
      return showToast("New password must be at least 6 characters", "error");
    setSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      showToast("Password changed successfully");
    } catch (e) {
      showToast(e.response?.data?.error || "Failed to change password", "error");
    } finally { setSaving(false); }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "chatbot", label: "Chatbot", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
  ];

  const SaveBtn = ({ onClick, label = "Save Changes" }) => (
    <button onClick={onClick} disabled={saving}
      className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-60 rounded-lg px-8 py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20">
      {saving ? "Saving..." : label}
    </button>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account and chatbot preferences</p>
        </div>

        {toast && (
          <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-lg flex items-center gap-2 ${
            toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
          }`}>
            {toast.type !== "error" && <Check size={16} />}
            {toast.msg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-2 space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/20"
                      : "text-gray-400 hover:bg-purple-500/10 hover:text-white"
                  }`}>
                  <tab.icon size={20} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-[#1a1a2e]/50 border border-purple-500/10 rounded-2xl p-6 hover:border-purple-500/20 transition-colors">
              {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map((i) => <div key={i} className="h-12 bg-purple-500/10 rounded-lg animate-pulse" />)}
                </div>
              ) : (
                <>
                  {activeTab === "profile" && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                      <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="John Doe" />
                      <Input label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="john@example.com" />
                      <Input label="Company" value={profile.company} onChange={(e) => setProfile({ ...profile, company: e.target.value })} placeholder="Your Company" />
                      <div className="pt-2"><SaveBtn onClick={handleSaveProfile} label="Save Profile" /></div>
                    </div>
                  )}

                  {activeTab === "notifications" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
                      <Toggle label="Email Notifications" description="Receive email updates about new messages" checked={settings.emailNotifications} onChange={(v) => setSettings({ ...settings, emailNotifications: v })} />
                      <Toggle label="Chat Alerts" description="Get notified of new chat messages" checked={settings.chatAlerts} onChange={(v) => setSettings({ ...settings, chatAlerts: v })} />
                      <Toggle label="Weekly Reports" description="Receive weekly performance summaries" checked={settings.weeklyReports} onChange={(v) => setSettings({ ...settings, weeklyReports: v })} />
                      <div className="pt-2"><SaveBtn onClick={handleSaveSettings} label="Save Preferences" /></div>
                    </div>
                  )}

                  {activeTab === "chatbot" && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-white">Chatbot Configuration</h2>
                      <Input label="Bot Name" value={settings.botName} onChange={(e) => setSettings({ ...settings, botName: e.target.value })} placeholder="Support Assistant" />
                      <Textarea label="Welcome Message" value={settings.welcomeMessage} onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })} rows={3} />
                      <Select label="Response Delay" value={settings.responseDelay} onChange={(e) => setSettings({ ...settings, responseDelay: e.target.value })}
                        options={[
                          { value: "instant", label: "Instant" },
                          { value: "slow", label: "Slow (1-2s)" },
                          { value: "natural", label: "Natural (2-3s)" },
                        ]}
                      />
                      <Select label="Language" value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                        options={[
                          { value: "english", label: "English" },
                          { value: "spanish", label: "Spanish" },
                          { value: "french", label: "French" },
                          { value: "german", label: "German" },
                        ]}
                      />
                      <p className="text-gray-400 text-sm">Widget appearance is managed in the <a href="/dashboard/integration" className="text-purple-400 hover:underline">Integration</a> page.</p>
                      <div className="pt-2"><SaveBtn onClick={handleSaveSettings} /></div>
                    </div>
                  )}

                  {activeTab === "security" && (
                    <div className="space-y-5">
                      <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                      <Select label="Session Timeout" value={settings.sessionTimeout} onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                        options={[
                          { value: "15", label: "15 minutes" },
                          { value: "30", label: "30 minutes" },
                          { value: "60", label: "60 minutes" },
                          { value: "never", label: "Never" },
                        ]}
                      />
                      <div className="border-t border-gray-800/30 pt-5">
                        <h3 className="text-white font-medium mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <Input
                            label="Current Password"
                            type={showPw.current ? "text" : "password"}
                            value={passwords.currentPassword}
                            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                            placeholder="••••••••"
                            rightElement={
                              <button type="button" onClick={() => setShowPw({ ...showPw, current: !showPw.current })} className="text-gray-500 hover:text-gray-300">
                                {showPw.current ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            }
                          />
                          <Input
                            label="New Password"
                            type={showPw.new ? "text" : "password"}
                            value={passwords.newPassword}
                            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            placeholder="••••••••"
                            rightElement={
                              <button type="button" onClick={() => setShowPw({ ...showPw, new: !showPw.new })} className="text-gray-500 hover:text-gray-300">
                                {showPw.new ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            }
                          />
                          <Input label="Confirm New Password" type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="••••••••" />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button onClick={handleSaveSettings} disabled={saving}
                          className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/30 rounded-lg px-6 py-2.5 text-white text-sm font-medium transition-all">
                          {saving ? "Saving..." : "Save Timeout"}
                        </button>
                        <button onClick={handleChangePassword} disabled={saving || !passwords.currentPassword || !passwords.newPassword}
                          className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-60 rounded-lg px-6 py-2.5 text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-purple-500/20">
                          {saving ? "Changing..." : "Change Password"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
