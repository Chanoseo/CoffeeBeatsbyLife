"use client";
import { useState } from "react";
import Image from "next/image";

interface AddSeatFormProps {
  onSeatAdded?: () => void; // callback to refresh seat list
}

function AddSeatForm({ onSeatAdded }: AddSeatFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

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
    const description =
      (form.elements.namedItem("description") as HTMLTextAreaElement)?.value ||
      "";
    const imageFile = (form.elements.namedItem("image") as HTMLInputElement)
      ?.files?.[0];

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

      const formData = new FormData();
      formData.append("seat", seatName);
      formData.append("capacity", capacity);
      formData.append("description", description);
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch("/api/seats", { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        setMessage("Seat added successfully!");
        form.reset();
        setPreview(null);
        if (onSeatAdded) onSeatAdded();
      } else {
        setError(data.message || "Failed to add seat.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred.");
    }

    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      {/* Image Preview */}
      {preview && (
        <div className="w-full h-40 mb-2">
          <Image
            src={preview}
            alt="Seat Preview"
            width={100}
            height={100}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label htmlFor="image">Seat Image</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="products-input-style"
          onChange={handleImageChange}
        />
      </div>

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
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter seat description"
          className="products-input-style"
          rows={3}
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
