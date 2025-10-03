"use client";

import { useState } from "react";

function AddUserForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Regex patterns
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = e.target as HTMLFormElement;
    const name = (
      form.elements.namedItem("name") as HTMLInputElement
    ).value.trim();
    const email = (
      form.elements.namedItem("email") as HTMLInputElement
    ).value.trim();
    const role = (form.elements.namedItem("role") as HTMLSelectElement).value;

    // Basic required fields check
    if (!name || !email || !role || !password || !confirmPassword) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    // Email regex validation
    if (!emailRegex.test(email)) {
      setError("Email must be a valid Gmail address.");
      setLoading(false);
      return;
    }

    // Password regex validation
    if (!passwordRegex.test(password)) {
      setError(
        "Password must be 8-32 characters, include uppercase, lowercase, number, and special character."
      );
      setLoading(false);
      return;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Check if email exists
      const checkRes = await fetch(
        `/api/users/check?email=${encodeURIComponent(email)}`
      );
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setError("Email already exists.");
        setLoading(false);
        return;
      }

      // Add user
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add user.");

      setMessage(data.message);
      form.reset();
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter name"
          className="products-input-style"
          required
        />
      </div>

      {/* Email */}
      <div className="flex flex-col gap-2">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email"
          className="products-input-style"
          required
        />
      </div>

      {/* Role */}
      <div className="flex flex-col gap-2">
        <label htmlFor="role">Role</label>
        <select id="role" name="role" className="products-input-style" required>
          <option value="">-- Select Role --</option>
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
          <option value="walkin">Walkin</option>
        </select>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password">Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Enter password"
            className="products-input-style w-full pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {password && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-[#3C604C] bg-transparent focus:outline-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </div>

      {/* Confirm Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="confirm-password">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm-password"
            placeholder="Confirm password"
            className="products-input-style w-full pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPassword && (
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-sm text-[#3C604C] bg-transparent focus:outline-none"
            >
              {showConfirmPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Adding..." : "Add User"}
      </button>
    </form>
  );
}

export default AddUserForm;
