"use client";

import { useState, useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white selection:text-black">
      {/* Subtle Dot Pattern Grid */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#52525b 1px, transparent 1px)`,
          backgroundSize: `24px 24px`
        }}
      />

      {/* Subtle Bottom Ambient Arc Reflection */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[250px] bg-gradient-to-t from-zinc-800/20 via-zinc-900/10 to-transparent blur-3xl pointer-events-none rounded-t-full" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl p-8 sm:p-10 shadow-2xl shadow-black relative z-10 transition-all">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 mb-4 shadow-sm group">
            <svg
              className="w-6 h-6 text-zinc-300 transition-transform duration-300 group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Superadmin Console
          </h1>
          <p className="text-[11px] text-zinc-400 mt-1.5 tracking-wider uppercase font-mono">
            AUTHENTICATION REQUIRED &bull; RUDRA.DEV
          </p>
        </div>

        {/* Error Alert Box */}
        {state?.error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/30 border border-red-900/50 flex items-center gap-3 text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-2">
            <svg
              className="w-4 h-4 flex-shrink-0 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{state.error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form action={formAction} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 tracking-wider mb-2 font-mono">
              Admin Identification
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                required
                placeholder="admin@rudra.dev"
                className="w-full px-4 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input with Eye Button */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 tracking-wider mb-2 font-mono">
              Security Key
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••••••"
                className="w-full pl-4 pr-11 py-3 bg-zinc-900/90 border border-zinc-800 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/50 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 text-zinc-500 hover:text-white transition-colors p-1 rounded-md focus:outline-none"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a8.962 8.962 0 013.682-.788c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m-4.092-4.092a3 3 0 11-4.243-4.243M3 3l18 18"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-3 py-3 px-4 bg-white text-black font-semibold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-white/5 hover:bg-zinc-200 active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-black"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Authorize Session</span>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 pt-5 border-t border-zinc-800/80 text-center flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            System Normal
          </span>
          <span>Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}