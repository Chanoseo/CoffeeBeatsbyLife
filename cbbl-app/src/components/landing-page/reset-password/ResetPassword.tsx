"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Password regex: 1 uppercase, 1 lowercase, 1 number, 1 special char, 8-32 chars
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Invalid or missing token");
      return;
    }

    // ✅ Check if fields are empty
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!passwordRegex.test(password)) {
      setError(
        "Password must be 8-32 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      setMessage("Password reset successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        {error && <p className="message-error mb-2">{error}</p>}
        {message && <p className="message-success mb-2">{message}</p>}
        <form onSubmit={handleSubmit}>
          {/* Password */}
          <div className="relative flex items-center mb-4 mt-2">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="input-style pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {password && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <p className="show-hide-password-style">Hide</p>
                ) : (
                  <p className="show-hide-password-style">Show</p>
                )}
              </button>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative flex items-center mb-4 mt-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="input-style pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            {confirmPassword && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <p className="show-hide-password-style">Hide</p>
                ) : (
                  <p className="show-hide-password-style">Show</p>
                )}
              </button>
            )}
          </div>

          <button type="submit" className="button-style w-full">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
