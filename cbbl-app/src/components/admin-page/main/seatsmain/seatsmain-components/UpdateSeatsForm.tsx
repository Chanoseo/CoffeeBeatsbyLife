"use client";

import { faExpand, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

type UpdateSeatFormProps = {
  seatId: string;
  initialData: {
    name: string;
    status: string;
    capacity?: number | null;
    imageUrl?: string;
    description?: string;
  };
  onSuccess: () => void;
};

function UpdateSeatForm({
  seatId,
  initialData,
  onSuccess,
}: UpdateSeatFormProps) {
  const [name, setName] = useState(initialData.name);
  const [capacity, setCapacity] = useState(
    initialData.capacity?.toString() ?? "1"
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [description, setDescription] = useState(initialData.description ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!name.trim() || !capacity || Number(capacity) < 1) {
      setError("Please fill in all fields and ensure capacity is at least 1.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("seat", name);
      formData.append("status", initialData.status);
      formData.append("capacity", capacity);
      formData.append("description", description);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`/api/seats/${seatId}`, {
        method: "PUT",
        body: formData, // 👈 send as multipart
      });

      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to update seat");

      setMessage("Seat updated successfully!");
      onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const currentImage = imageFile
    ? URL.createObjectURL(imageFile)
    : initialData.imageUrl || null;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}

      <div className="flex flex-col gap-2">
        {(() => {
          let displayStatus = initialData.status;
          let badgeClass =
            "px-3 py-1 text-sm font-medium rounded-full w-full text-center";

          if (initialData.status === "order") {
            displayStatus = "Reserved";
            badgeClass += " bg-red-100 text-red-600 border border-red-200";
          } else if (initialData.status === "walkin") {
            displayStatus = "Occupied";
            badgeClass += " bg-blue-100 text-blue-600 border border-blue-200";
          } else {
            displayStatus = "Available";
            badgeClass +=
              " bg-green-100 text-green-600 border border-green-200";
          }

          return <span className={badgeClass}>{displayStatus}</span>;
        })()}
      </div>

      <div className="flex flex-col gap-2">
        {currentImage && (
          <div className="relative w-full h-40 mb-2">
            <Image
              src={currentImage}
              alt="Seat preview"
              width={250}
              height={250}
              className="w-full h-full object-cover rounded-xl shadow-sm"
            />

            {/* Resize Icon */}
            <button
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/50 text-gray-700 rounded-full hover:bg-white hover:text-[#3C604C] transition-colors"
              type="button"
              onClick={() => setExpandedImage(currentImage)}
            >
              <FontAwesomeIcon icon={faExpand} className="text-sm" />
            </button>
          </div>
        )}

        {/* Expanded Image Section */}
        {expandedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            {/* Close button */}
            <button
              className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center 
                 bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-600 
                 transition-colors shadow-md"
              type="button"
              onClick={() => setExpandedImage(null)}
            >
              <FontAwesomeIcon icon={faX} className="text-lg" />
            </button>

            {/* Image container */}
            <div className="max-w-3xl max-h-[85vh] w-auto h-auto p-4 flex items-center justify-center">
              <Image
                src={expandedImage}
                alt="Expanded seat preview"
                width={800}
                height={800}
                className="max-w-full max-h-[80vh] object-contain shadow-lg"
              />
            </div>
          </div>
        )}

        <label>Seat Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="products-input-style"
        />
      </div>

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

      <div className="flex flex-col gap-2">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="products-input-style"
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label>Capacity</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          className="products-input-style"
          min={1}
          required
        />
      </div>

      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Updating..." : "Update Seat"}
      </button>
    </form>
  );
}

export default UpdateSeatForm;
