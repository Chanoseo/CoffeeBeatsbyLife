"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import UpdateSeatForm from "./UpdateSeatsForm";
import { useState } from "react";

interface UpdateSeatsProps {
  onClose: () => void;
  seatId: string;
  initialData: {
    name: string;
    status: string;
    capacity: number;
  };
  onRefresh: () => void; // ✅ callback to refresh seats in real-time
}

function UpdateSeats({
  onClose,
  seatId,
  initialData,
  onRefresh,
}: UpdateSeatsProps) {
  const [loading, setLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this seat?")) return;

    setLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/seats/${seatId}`, { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        setDeleteError(data.message || "Failed to delete seat");
        return;
      }

      // ✅ Real-time refresh
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-full h-full z-50 flex justify-end bg-black/10">
      <div className="w-full md:w-1/3 bg-white p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Update Seat</h2>
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faTrash}
              className={`text-xl cursor-pointer ${
                loading ? "text-gray-400" : "text-red-500 hover:text-red-600"
              }`}
              onClick={loading ? undefined : handleDelete}
            />
            <FontAwesomeIcon
              icon={faX}
              onClick={onClose}
              className="text-xl cursor-pointer hover:text-gray-600"
            />
          </div>
        </div>

        {deleteError && <p className="message-error">{deleteError}</p>}

        <UpdateSeatForm
          seatId={seatId}
          initialData={initialData}
          onSuccess={onRefresh}
        />
      </div>
    </div>
  );
}

export default UpdateSeats;
