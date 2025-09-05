"use client";

import { useState } from "react";

function AddSeatForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const seatName = (form.elements.namedItem("seat") as HTMLInputElement).value.trim();

    if (!seatName) {
      setError("Please enter a seat name.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/seats", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Seat added successfully!");
        form.reset();

        // ✅ Optional: reload after 2 seconds
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setError("Failed to add seat.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      {/* Seat Name Input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="seat">Seat</label>
        <input
          id="seat"
          name="seat"
          type="text"
          placeholder="Enter seat name"
          className="products-input-style"
          required
        />
      </div>

      {/* Submit Button */}
      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Adding..." : "Add Seat"}
      </button>
    </form>
  );
}

export default AddSeatForm;
