"use client";

import { useState } from "react";
import api from "@lib/api";
import { useRouter } from "next/navigation";
import Input from "@components/ui/Input";

export default function AuthForm() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 from-gray-50 via-blue-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/10 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/10 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/5 bg-cyan-500/15 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Auth form container */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 dark:from-white dark:to-zinc-400 from-gray-900 to-gray-600 bg-clip-text text-transparent">
            AI ChatBot
          </h2>
          <p className="text-zinc-500 dark:text-zinc-500 text-gray-600 mt-2 text-sm">
            {isLogin ? "Welcome back! Please login to continue." : "Create your account to get started."}
          </p>
        </div>

        {/* Form card with glassmorphism effect */}
        <form 
          onSubmit={submit} 
          className="relative bg-zinc-900/80 dark:bg-zinc-900/80 bg-white/80 backdrop-blur-xl p-8 py-12 rounded-3xl border border-zinc-800/50 dark:border-zinc-800/50 border-gray-200 shadow-2xl shadow-black/50 dark:shadow-black/50 shadow-purple-500/10 space-y-6 animate-slide-up"
        >
          {/* Gradient border effect */}
          {/* <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur transition-opacity z-0"></div> */}

          {/* Tab switcher */}
          <div className="flex gap-2 p-1.5 bg-zinc-800/50 dark:bg-zinc-800/50 bg-gray-100 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                if (!isLogin) {
                  setIsLogin(true);
                  setError("");
                  setForm({ name: "", email: "", password: "" });
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                isLogin 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-zinc-400 dark:text-zinc-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                if (isLogin) {
                  setIsLogin(false);
                  setError("");
                  setForm({ name: "", email: "", password: "" });
                }
              }}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/25' 
                  : 'text-zinc-400 dark:text-zinc-400 text-gray-600 hover:text-white dark:hover:text-white hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {!isLogin && (
              <div className="animate-slide-down">
                <Input
                  variant="auth"
                  label="Full Name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required={!isLogin}
                  focusColor="purple"
                  icon={() => (
                    <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                />
              </div>
            )}

            <Input
              variant="auth"
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              focusColor="blue"
              icon={() => (
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
            />

            <Input
              variant="auth"
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
              focusColor="blue"
              icon={() => (
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r ${
              isLogin ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
            } text-white rounded-xl py-3.5 font-semibold shadow-lg ${
              isLogin ? 'shadow-blue-500/25' : 'shadow-purple-500/25'
            } transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? "Sign In" : "Create Account"}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>

          {/* Footer links */}
          <div className="pt-4 border-t border-zinc-800/50">
            <p className="text-sm text-zinc-500 text-center">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button 
                type="button" 
                className={`font-medium ${
                  isLogin ? 'text-blue-400 hover:text-blue-300' : 'text-purple-400 hover:text-purple-300'
                } transition-colors`}
                onClick={toggleMode}
              >
                {isLogin ? "Sign up for free" : "Sign in"}
              </button>
            </p>
          </div>
        </form>

        {/* Additional info */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

