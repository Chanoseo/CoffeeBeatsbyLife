"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ChangeProfileProps {
  user: {
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
  onClose: () => void;
}

// ✅ Define a proper response type (no `any`)
interface ChangeProfileResponse {
  success: boolean;
  message?: string;
  user?: {
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export default function ChangeProfile({ user, onClose }: ChangeProfileProps) {
  const [name, setName] = useState(user.name);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user.image ?? null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

  // Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (newPassword && !confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (newPassword && !passwordRegex.test(newPassword)) {
      setError(
        "Password must be 8-32 characters long, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (newPassword) formData.append("password", newPassword);
      if (selectedFile) formData.append("image", selectedFile);

      const res = await fetch("/api/change-profile", {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const errData: { error?: string } = await res.json();
        setError(errData.error || "Failed to update profile");
        return;
      }

      const result: ChangeProfileResponse = await res.json();

      setSuccess(result.message || "Profile updated successfully!");

      if (result.success) {
        // 🔑 simplest + reliable: reload so session refetches from backend
        window.location.reload();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    }
  };

  // Sync with latest props
  useEffect(() => {
    setName(user.name);
    setPreviewImage(user.image ?? null);
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg relative">
        {/* Profile image */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 relative mb-2">
            {previewImage ? (
              <Image
                key={previewImage}
                src={previewImage}
                alt={user.name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#3C604C] flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <label className="cursor-pointer text-sm text-[#3C604C] hover:underline">
            Change Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <h2 className="text-xl font-bold text-center mb-4">Change Profile</h2>

        {error && <p className="message-error">{error}</p>}
        {success && <p className="message-success">{success}</p>}

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Name
          </label>
          <input
            type="text"
            className="w-full mt-1 p-2 border rounded-md focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Role */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Role
          </label>
          <input
            type="text"
            value={user.role}
            disabled
            className="w-full mt-1 p-2 border rounded-md bg-gray-100 dark:bg-gray-600 dark:text-gray-400 cursor-not-allowed"
          />
        </div>

        {/* Password */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full mt-1 p-2 border rounded-md pr-16 focus:outline-none"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#3C604C]"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            )}
          </div>
        </div>

        {/* Confirm Password */}
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="w-full mt-1 p-2 border rounded-md pr-16 focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && (
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-[#3C604C]"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#3C604C] text-white rounded-md hover:bg-[#345240]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
