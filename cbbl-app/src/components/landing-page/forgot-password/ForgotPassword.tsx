"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ✅ Gmail-only regex
  const emailRegex = /^[^\s@]+@gmail\.com$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Check if email is empty
    if (!email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    // Validate Gmail-only
    if (!emailRegex.test(email)) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setMessage("The password reset link has been sent to your email.");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        <p className="mb-4 text-sm text-gray-600">
          Enter your Gmail to receive a password reset link.
        </p>
        {error && <p className="message-error">{error}</p>}
        {message && <p className="message-success">{message}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="input-style mb-4 w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="button-style w-full">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
