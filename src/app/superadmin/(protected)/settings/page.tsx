/* eslint-disable no-undef */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ApiKeyItem {
  _id?: string;
  name: string;
  key: string;
  status: "Active" | "Revoked";
  createdAt?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "pricing" | "security" | "system" | "api">("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Enterprise Settings State
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    title: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    linkedin: "",
    avatarUrl: "",
    resumeUrl: "",
  });

  const [pricing, setPricing] = useState({
    hourlyRate: 75,
    currency: "USD",
    minProjectBudget: 1000,
    taxRate: 0,
    paymentTerms: "Net 15",
  });

  const [security, setSecurity] = useState({
    twoFactorEnabled: true,
    sessionTimeoutMinutes: 60,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [system, setSystem] = useState({
    siteTitle: "",
    metaDescription: "",
    maintenanceMode: false,
    publicSignups: false,
    analyticsEnabled: true,
    emailNotifications: true,
  });

  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([]);

  // Fetch initial configuration on mount
  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();

      if (data.success && data.data) {
        if (data.data.profile) setProfile((prev) => ({ ...prev, ...data.data.profile }));
        if (data.data.pricing) setPricing((prev) => ({ ...prev, ...data.data.pricing }));
        if (data.data.security) setSecurity((prev) => ({ ...prev, ...data.data.security }));
        if (data.data.system) setSystem((prev) => ({ ...prev, ...data.data.system }));
        if (data.data.apiKeys) setApiKeys(data.data.apiKeys);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load settings data from database");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Universal save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving configuration changes...");

    try {
      const payload = {
        profile,
        pricing,
        security: {
          twoFactorEnabled: security.twoFactorEnabled,
          sessionTimeoutMinutes: security.sessionTimeoutMinutes,
        },
        system,
        apiKeys,
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Settings saved successfully!", { id: toastId });
        setSecurity((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        toast.error(data.error || "Failed to update settings.", { id: toastId });
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occurred while saving.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateApiKey = () => {
    const newKey: ApiKeyItem = {
      name: "New API Key",
      key: `pk_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6)}`,
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    setApiKeys([...apiKeys, newKey]);
    toast.info("Generated key locally. Click 'Save' to persist changes.");
  };

  const handleRevokeKey = (keyToRevoke: string) => {
    toast("Are you sure you want to revoke this API Key?", {
      action: {
        label: "Confirm",
        onClick: () => {
          setApiKeys(apiKeys.map((k) => (k.key === keyToRevoke ? { ...k, status: "Revoked" } : k)));
          toast.success("API key revoked. Save settings to finalize.");
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs font-mono text-emerald-500/70 animate-pulse tracking-widest uppercase">
        Connecting to system secure kernel...
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Page Header */}
      <div className="border-b border-zinc-800/80 pb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-mono tracking-widest text-emerald-400/80 uppercase">System Core</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-1">
          System <span className="text-emerald-500">Settings</span>
        </h1>
        <p className="text-xs text-zinc-400 mt-2 font-mono">
          Manage system configurations, rates, profile parameters, authentication rules, and API tokens.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: "profile", label: "Profile Information" },
          { id: "pricing", label: "Pricing & Rates" },
          { id: "security", label: "Security & Access" },
          { id: "system", label: "System Preferences" },
          { id: "api", label: "API Credentials" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all duration-300 whitespace-nowrap relative ${
                isActive
                  ? "bg-zinc-900 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full shadow-[0_0_6px_rgba(16,185,129,1)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE SETTINGS */}
      {activeTab === "profile" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-6 backdrop-blur-md shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Public Profile Information
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">SECTION 01</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Primary Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-amber-200/90"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Headline / Designation</label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 mb-2">Developer Bio</label>
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none font-sans"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-zinc-800/80">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Avatar URL</label>
                <input
                  type="text"
                  value={profile.avatarUrl}
                  onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Resume / CV Document URL</label>
                <input
                  type="text"
                  value={profile.resumeUrl}
                  onChange={(e) => setProfile({ ...profile, resumeUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-zinc-800/80">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Website URL</label>
                <input
                  type="text"
                  value={profile.website}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">GitHub Handle</label>
                <input
                  type="text"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">LinkedIn Handle</label>
                <input
                  type="text"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving Profile..." : "Save Profile"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PRICING & RATES */}
      {activeTab === "pricing" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <h2 className="text-xs font-bold text-amber-400 font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Financial & Billing Rates
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">SECTION 02</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-zinc-900/40 border border-amber-500/10 rounded-xl relative overflow-hidden">
                <label className="block text-xs font-mono text-amber-300/90 mb-2">General Hourly Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    value={pricing.hourlyRate}
                    onChange={(e) => setPricing({ ...pricing, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-emerald-400 focus:outline-none focus:border-amber-500/50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
                <label className="block text-xs font-mono text-zinc-400 mb-2">Default Currency</label>
                <select
                  value={pricing.currency}
                  onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl">
                <label className="block text-xs font-mono text-zinc-400 mb-2">Minimum Project Budget</label>
                <input
                  type="number"
                  value={pricing.minProjectBudget}
                  onChange={(e) => setPricing({ ...pricing, minProjectBudget: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-zinc-800/80">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Standard Tax Rate (%)</label>
                <input
                  type="number"
                  value={pricing.taxRate}
                  onChange={(e) => setPricing({ ...pricing, taxRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Payment Terms</label>
                <input
                  type="text"
                  value={pricing.paymentTerms}
                  onChange={(e) => setPricing({ ...pricing, paymentTerms: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500/50 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving Config..." : "Save Pricing Config"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SECURITY SETTINGS */}
      {activeTab === "security" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Authentication Controls
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">SECTION 03</span>
            </div>

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={security.sessionTimeoutMinutes}
                  onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 font-mono"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800/80">
              <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Two-Factor Authentication (2FA)</p>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    Require multi-factor authentication token on login sessions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                  className={`w-12 h-6 rounded-full transition-all relative p-1 border ${
                    security.twoFactorEnabled
                      ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-zinc-900 border-zinc-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full transition-all ${
                      security.twoFactorEnabled
                        ? "translate-x-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"
                        : "translate-x-0 bg-zinc-500"
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
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Updating Controls..." : "Save Security Controls"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: SYSTEM PREFERENCES */}
      {activeTab === "system" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Console Preferences & Metadata
              </h2>
              <span className="text-[10px] font-mono text-zinc-500">SECTION 04</span>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Console Title</label>
                <input
                  type="text"
                  value={system.siteTitle}
                  onChange={(e) => setSystem({ ...system, siteTitle: e.target.value })}
                  className="w-full max-w-md px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-2">Meta Description</label>
                <textarea
                  rows={2}
                  value={system.metaDescription}
                  onChange={(e) => setSystem({ ...system, metaDescription: e.target.value })}
                  className="w-full max-w-lg px-3.5 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                />
              </div>

              <div className="pt-4 border-t border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-amber-500/10 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-amber-200">Maintenance Mode</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Disable public site traffic and render maintenance splash page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSystem({ ...system, maintenanceMode: !system.maintenanceMode })}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 border ${
                      system.maintenanceMode
                        ? "bg-amber-500/20 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                        : "bg-zinc-900 border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-all ${
                        system.maintenanceMode
                          ? "translate-x-6 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]"
                          : "translate-x-0 bg-zinc-500"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl">
                  <div>
                    <p className="text-xs font-semibold text-white">Analytics Data Collection</p>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      Collect visitor tracking metrics and API invocation rates.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSystem({ ...system, analyticsEnabled: !system.analyticsEnabled })}
                    className={`w-12 h-6 rounded-full transition-all relative p-1 border ${
                      system.analyticsEnabled
                        ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        : "bg-zinc-900 border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full transition-all ${
                        system.analyticsEnabled
                          ? "translate-x-6 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"
                          : "translate-x-0 bg-zinc-500"
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
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Saving Preferences..." : "Save Preferences"}
            </button>
          </div>
        </form>
      )}

      {/* TAB 5: API CREDENTIALS */}
      {activeTab === "api" && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="p-6 bg-zinc-950/90 border border-zinc-800/80 rounded-2xl space-y-6 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <div>
                <h2 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active API Tokens
                </h2>
                <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                  Manage encrypted tokens used for remote data routing.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGenerateApiKey}
                className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/30 text-xs font-mono text-emerald-300 rounded-xl transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] active:scale-95"
              >
                + Generate Token
              </button>
            </div>

            <div className="divide-y divide-zinc-800/60">
              {apiKeys.map((keyItem) => (
                <div key={keyItem.key} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-white">{keyItem.name}</p>
                    <p className="text-[11px] font-mono text-amber-200/70 mt-1 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800 inline-block">
                      {keyItem.key}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        keyItem.status === "Active"
                          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_8px_rgba(16,185,129,0.2)]"
                          : "text-red-400 bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      {keyItem.status}
                    </span>
                    {keyItem.status === "Active" && (
                      <button
                        type="button"
                        onClick={() => handleRevokeKey(keyItem.key)}
                        className="text-xs font-mono text-zinc-500 hover:text-red-400 transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-zinc-950 font-mono text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? "Persisting Config..." : "Save API Configuration"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}