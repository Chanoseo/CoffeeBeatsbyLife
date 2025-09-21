"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface User {
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate?: (user: User) => void; // optional callback for parent
}

export default function ProfileModal({
  user,
  onClose,
  onUpdate,
}: ProfileModalProps) {
  const [name, setName] = useState(user.name ?? "");
  const [previewImage, setPreviewImage] = useState(user.image ?? null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/;

  // Handle image selection
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
    setError(null);
    setSuccess(null);

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

      const res = await fetch("/api/profile", {
        method: "PUT",
        body: formData, // send FormData instead of JSON
      });

      const result: { message?: string; user?: User; error?: string } =
        await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to update profile");

      if (result.user) {
        setPreviewImage(result.user.image ?? null);
        setName(result.user.name ?? "");
        onUpdate?.(result.user);
        setSelectedFile(null); // reset file input
      }

      setSuccess(result.message || "Profile updated successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Something went wrong!");
    }
  };

  // Refresh latest user data if parent updates
  useEffect(() => {
    setName(user.name ?? "");
    setPreviewImage(user.image ?? null);
  }, [user]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✖
        </button>

        <div className="flex flex-col items-center mb-4">
          <div className="w-24 h-24 relative mb-2">
            {previewImage ? (
              <Image
                key={previewImage} // force refresh on new URL
                src={previewImage}
                alt={user.name ?? "User"}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#3C604C] flex items-center justify-center text-white text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
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

        <h2 className="text-xl font-bold text-center mb-4">Edit Profile</h2>

        {error && <p className="message-error">{error}</p>}
        {success && <p className="message-success">{success}</p>}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C]/30"
            placeholder="Enter your name"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={user.email ?? ""}
            disabled
            className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="password">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              placeholder="Enter new password"
              className="w-full px-3 py-2 border rounded-lg pr-16 focus:outline-none focus:ring-2 focus:ring-[#3C604C]/30"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            {newPassword && (
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

        <div className="flex flex-col gap-2 mb-6">
          <label htmlFor="confirm-password">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border rounded-lg pr-16 focus:outline-none focus:ring-2 focus:ring-[#3C604C]/30"
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

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button onClick={handleSave} className="button-style">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
