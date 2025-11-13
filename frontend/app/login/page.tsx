"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const t = {
    title: "Sign In",
    subtitle: "Access to risk prediction system",
    usernameLabel: "Username",
    passwordLabel: "Password",
    remember: "Remember me",
    forgot: "Forgot password?",
    submit: "Sign In",
    processing: "Processing…",
    or: "or",
    terms: "Terms",
    privacy: "Privacy",
    error: "Invalid username or password",
    toggleEye: "Show password",
    hideEye: "Hide password",
    language: "English",
  }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setError("")
  //   setLoading(true)
  //   try {
  //     // Sample login: admin/admin
  //     if (username === "admin" && password === "admin") {
  //       if (typeof window !== "undefined") {
  //         localStorage.setItem("isLoggedIn", "true")
  //         if (remember) localStorage.setItem("remember", "true")
  //       }
  //       router.replace("/")
  //     } else {
  //       setError(t.error)
  //     }
  //   } finally {
  //     setLoading(false)
  //   }
  // }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login?username=" + username + "&password=" + password, {
        method: "POST",
      });

      if (!res.ok) {
        setError("Invalid username or password");
        return;
      }

      const data = await res.json();

      if (typeof window !== "undefined") {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        if (remember) localStorage.setItem("remember", "true");
      }

      router.replace("/");
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };


  return (  
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
      style={{
        backgroundImage: `repeating-linear-gradient(
          -20deg,
          transparent 0px,
          transparent 100px,
          rgba(94, 165, 250, 0.1) 100px,
          rgba(94, 165, 250, 0.1) 200px
        )`,
        backgroundSize: '200px 200px',
        animation: 'diagonalFlow 80s linear infinite'
      }}
    >
      <style jsx>{`
        @keyframes diagonalFlow {
          0% {
            background-position: 0% 100%; /* Start from top-right */
          }
          100% {
            background-position: 100% 0%; /* Move to bottom-left, seamless loop */
          }
        }
      `}</style>  

      <Card className="relative w-full max-w-sm p-8 bg-white/100 backdrop-blur-md shadow-xl border border-slate-200/70">
        {/* Accent bar */}
        <div className="absolute -top-[1px] left-0 right-0 h-1 rounded-t-[10px] bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />

        {/* Accent bar bottom */}
        <div className="absolute -bottom-[1px] left-0 right-0 h-1 rounded-b-[10px] bg-gradient-to-r from-indigo-500 via-blue-500 to-sky-400" />
       
        {/* Accent bar left */}
        <div className="absolute -left-[1px] top-0 bottom-0 w-1 rounded-l-[10px] bg-gradient-to-b from-sky-400 via-blue-500 to-indigo-500" />
       
        {/* Accent bar right */}
        <div className="absolute -right-[1px] top-0 bottom-0 w-1 rounded-r-[10px] bg-gradient-to-b from-indigo-500 via-blue-500 to-sky-400" />

        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center animate-pulse [animation-delay:1s]">
            <span className="text-2xl font-serif font-black bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">M</span>
          </div>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-sm text-muted-foreground mt-1">{t.subtitle}</p>
        </div>
       
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* General error */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username">{t.usernameLabel}</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                autoComplete="username"
                className="pl-9"
              />
              {/* Left icon */}
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 drop-shadow-sm" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="userGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1D4ED8', stopOpacity: 1}} />
                  </linearGradient>
                  <filter id="userShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#00000020" />
                  </filter>
                </defs>
                <g filter="url(#userShadow)">
                  <circle cx="12" cy="7" r="4" fill="url(#userGrad)" />
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="url(#userGrad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>
            </div>
          </div>

          {/* Password with toggle */}
          <div className="space-y-1.5">
            <Label htmlFor="password">{t.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="pr-10 pl-9"
              />
              {/* Left lock icon */}
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 drop-shadow-sm" viewBox="0 0 24 24" fill="none">
                <defs>
                  <linearGradient id="lockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 1}} />
                    <stop offset="100%" style={{stopColor: '#1D4ED8', stopOpacity: 1}} />
                  </linearGradient>
                  <filter id="lockShadow" x="-50%" y="-50%" width="200%" height="200%">
                    <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#00000020" />
                  </filter>
                </defs>
                <g filter="url(#lockShadow)">
                  <rect x="4" y="11" width="16" height="9" rx="2" fill="url(#lockGrad)" stroke="none" />
                  <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="url(#lockGrad)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </g>
              </svg>

              {/* Right eye toggle */}
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700"
                aria-label={showPassword ? t.hideEye : t.toggleEye}
              >
                {showPassword ? (
                  // eye-off
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9.88 5.09A9.77 9.77 0 0 1 12 5c5 0 9.27 3.11 10.5 7.5a11.28 11.28 0 0 1-3.17 4.86M6.18 6.18A11.32 11.32 0 0 0 1.5 12.5 11.4 11.4 0 0 0 6.2 17.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  // eye
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" onChange={(e) => setRemember(e.target.checked)} />
              {t.remember}
            </label>
            <a href="/forgot-password" className="text-sm text-sky-600 hover:underline">{t.forgot}</a>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full h-10 bg-primary text-white rounded-md hover:bg-primary/90 transition disabled:opacity-70"
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
                  <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" />
                </svg>
                {t.processing}
              </span>
            ) : (
              t.submit
            )}
          </Button>

          {/* Small footer */}
          <div className="text-center text-xs text-slate-500">
            <a href="/terms" className="hover:underline">{t.terms}</a> · <a href="/privacy" className="hover:underline">{t.privacy}</a>
          </div>
        </form>
      </Card>
    </div>
  )
}