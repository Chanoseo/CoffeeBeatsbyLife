"use client";

import { useState } from "react";

interface UpdateUserFormProps {
  user: {
    name: string | null;
    email: string | null;
    role: string;
  };
}

function UpdateUserForm({ user }: UpdateUserFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [name, setName] = useState(user.name || "");
  const [email] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "user");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRegex = /^[^\s@]+@gmail\.com$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Basic validation
    if (!name || !email || !role) {
      setError("Please fill all required fields.");
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Email must be a valid Gmail address.");
      setLoading(false);
      return;
    }

    if (password && !passwordRegex.test(password)) {
      setError(
        "Password must be 8-32 characters, include uppercase, lowercase, number, and special character."
      );
      setLoading(false);
      return;
    }

    if (password && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // Update user API
      const res = await fetch(`/api/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user.");

      setMessage(data.message || "User updated successfully.");
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
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          className="products-input-style bg-gray-100 cursor-not-allowed"
          value={email}
          disabled
        />
      </div>

      {/* Role */}
      <div className="flex flex-col gap-2">
        <label htmlFor="role">Role</label>
        <select
          id="role"
          name="role"
          className="products-input-style"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="admin">Admin</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-2">
        <label htmlFor="password">New Password (optional)</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            placeholder="Enter new password"
            className="products-input-style w-full pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <label htmlFor="confirm-password">Confirm New Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirm-password"
            placeholder="Confirm new password"
            className="products-input-style w-full pr-10"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
        {loading ? "Updating..." : "Update User"}
      </button>
    </form>
  );
}

export default UpdateUserForm;
