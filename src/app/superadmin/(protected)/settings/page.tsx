/* eslint-disable no-undef */
"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "system" | "api">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [profile, setProfile] = useState({
    fullName: "Super Admin",
    email: "admin@system.local",
    title: "Full Stack Engineer & Tech Lead",
    bio: "Passionate developer building scalable web applications, machine learning implementations, and full-stack systems.",
    location: "India / Remote",
    website: "https://portfolio.local",
    github: "github.com/admin",
    linkedin: "linkedin.com/in/admin",
  });

  // Security Form State
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactorEnabled: true,
  });

  // System Configuration State
  const [system, setSystem] = useState({
    siteTitle: "Admin Portfolio Console",
    maintenanceMode: false,
    publicSignups: false,
    analyticsEnabled: true,
    emailNotifications: true,
  });

  // API Keys Mock State
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production Gateway", key: "pk_live_98a7s...3f90", created: "2026-01-15", status: "Active" },
    { id: "2", name: "Dev Testing Token", key: "pk_test_12a4b...88c2", created: "2026-03-02", status: "Active" },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate Server Action / API persistence
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <h1 className="text-2xl font-bold text-white tracking-tight font-sans">
          System Settings
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 font-mono">
          Manage system configurations, administrator profile, authentication security, and API credentials.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto">
        {[
          { id: "profile", label: "Profile Information" },
          { id: "security", label: "Security & Passwords" },
          { id: "system", label: "System Preferences" },
          { id: "api", label: "API Credentials" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-zinc-800 text-white border border-zinc-700/80 shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Save Toast Feedback */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Configuration updated successfully!</span>
        </div>
      )}

      {/* TAB 1: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Public Profile Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Primary Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Headline / Designation</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2">Developer Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-zinc-800/80">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Website URL</label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">GitHub Handle</label>
                <input
                  type="text"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">LinkedIn Handle</label>
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY SETTINGS */}
      {activeTab === "security" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Authentication Credentials
            </h2>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Current Password</label>
                <input
                  type="password"
                  value={security.currentPassword}
                  onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">New Password</label>
                <input
                  type="password"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Require multi-factor authentication token on login sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                    security.twoFactorEnabled ? "bg-emerald-500" : "bg-zinc-800"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full transition-transform ${
                      security.twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Updating Security..." : "Update Password"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SYSTEM PREFERENCES */}
      {activeTab === "system" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl space-y-6">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Console Preferences
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Console Title</label>
                <input
                  type="text"
                  value={system.siteTitle}
                  onChange={(e) => setSystem({ ...system, siteTitle: e.target.value })}
                  className="w-full max-w-md px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Maintenance Mode</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Disable public site traffic and render maintenance splash page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSystem({ ...system, maintenanceMode: !system.maintenanceMode })}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                      system.maintenanceMode ? "bg-amber-500" : "bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        system.maintenanceMode ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">Analytics Data Collection</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Collect visitor tracking metrics and API invocation rates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSystem({ ...system, analyticsEnabled: !system.analyticsEnabled })}
                    className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                      system.analyticsEnabled ? "bg-emerald-500" : "bg-zinc-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        system.analyticsEnabled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-white text-black text-xs font-semibold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isSaving ? "Saving System Settings..." : "Save Preferences"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: API CREDENTIALS */}
      {activeTab === "api" && (
        <div className="space-y-6">
          <div className="p-6 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Active API Tokens
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Manage access tokens used for portfolio data routing.
                </p>
              </div>
              <button
                onClick={() =>
                  setApiKeys([
                    ...apiKeys,
                    {
                      id: String(Date.now()),
                      name: "New API Key",
                      key: `pk_live_${Math.random().toString(36).substring(2, 9)}`,
                      created: new Date().toISOString().split("T")[0],
                      status: "Active",
                    },
                  ])
                }
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 text-xs font-mono text-white rounded-xl hover:bg-zinc-800 transition-colors"
              >
                + Generate Key
              </button>
            </div>

            <div className="divide-y divide-zinc-800/80">
              {apiKeys.map((key) => (
                <div key={key.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{key.name}</p>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">{key.key}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      {key.status}
                    </span>
                    <button
                      onClick={() => setApiKeys(apiKeys.filter((k) => k.id !== key.id))}
                      className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}