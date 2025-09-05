"use client";

import { useState } from "react";

type UpdateSeatFormProps = {
  seatId: string;
  initialData: {
    name: string;
    status: string;
  };
  onSuccess: () => void;
};

function UpdateSeatForm({
  seatId,
  initialData,
  onSuccess,
}: UpdateSeatFormProps) {
  const [name, setName] = useState(initialData.name);
  const [status, setStatus] = useState(initialData.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!name.trim() || !status.trim()) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/seats/${seatId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status }),
      });

      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to update seat");

      setMessage("Seat updated successfully!");

      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      {/* Seat Name */}
      <div className="flex flex-col gap-2">
        <label>Seat Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="products-input-style"
          required
        />
      </div>

      {/* Seat Status Dropdown */}
      <div className="flex flex-col gap-2">
        <label>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="products-input-style"
          required
        >
          <option value="">Select Status</option>
          <option value="Available">Available</option>
          <option value="Reserved">Reserved</option>
        </select>
      </div>

      {/* Submit Button */}
      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Updating..." : "Update Seat"}
      </button>
    </form>
  );
}

export default UpdateSeatForm;
