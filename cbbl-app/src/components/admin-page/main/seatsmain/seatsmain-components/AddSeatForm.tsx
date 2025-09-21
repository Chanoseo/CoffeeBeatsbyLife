"use client";
import { useState } from "react";

interface AddSeatFormProps {
  onSeatAdded?: () => void; // callback to refresh seat list
}

function AddSeatForm({ onSeatAdded }: AddSeatFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const form = e.target as HTMLFormElement;
    const seatName = (
      form.elements.namedItem("seat") as HTMLInputElement
    ).value.trim();
    const capacity = (form.elements.namedItem("capacity") as HTMLInputElement)
      .value;

    if (!seatName) {
      setError("Please enter a seat name.");
      setLoading(false);
      return;
    }

    if (!capacity || Number(capacity) < 1) {
      setError("Please enter at least 1 capacity.");
      setLoading(false);
      return;
    }

    try {
      const checkRes = await fetch(
        `/api/seats/check?name=${encodeURIComponent(seatName)}`
      );
      const checkData = await checkRes.json();
      if (checkData.exists) {
        setError("Seat name already exists.");
        setLoading(false);
        return;
      }

      const formData = new FormData(form);
      const res = await fetch("/api/seats", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Seat added successfully!");
        form.reset();
        if (onSeatAdded) onSeatAdded(); // ✅ trigger refresh
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

      <div className="flex flex-col gap-2">
        <label htmlFor="capacity">Capacity</label>
        <input
          id="capacity"
          name="capacity"
          type="number"
          min="1"
          placeholder="Enter seat capacity"
          className="products-input-style"
          required
        />
      </div>

      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Adding..." : "Add Seat"}
      </button>
    </form>
  );
}

export default AddSeatForm;
