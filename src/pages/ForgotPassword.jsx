import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    
    // TODO: Implement password reset API call
    // await api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
    
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-8 md:p-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            CF
          </div>
          <h1 className="mt-6 text-2xl md:text-3xl font-bold text-slate-900">
            Reset Password
          </h1>
          <p className="mt-2 text-slate-500 text-sm md:text-base text-center">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="inline-flex p-3 rounded-full bg-green-100 text-green-600 mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Check your email
            </h2>
            <p className="text-slate-500 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="border-2 border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 hover:border-slate-300 focus-within:border-slate-900 transition-colors">
                <Mail className="h-5 w-5 text-slate-400 flex-shrink-0" />
                <input
                  className="w-full outline-none text-slate-900 placeholder:text-slate-400"
                  type="email"
                  placeholder="user@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl py-3.5 bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {submitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
