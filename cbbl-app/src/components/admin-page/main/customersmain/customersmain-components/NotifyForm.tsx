import { useState } from "react";

export default function NotifyForm({ onClose }: { onClose: () => void }) {
  const [storeStatus, setStoreStatus] = useState<"open" | "closed" | "busy">(
    "open"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeStatus }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      console.log("Notification sent:", data.notification);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to send notification");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg w-full max-w-md"
      >
        <h2 className="text-lg font-bold mb-4">Notify Customers</h2>

        <div className="flex flex-col mb-4">
          <label className="text-gray-700 mb-1">Store Status:</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storeStatus"
                value="open"
                checked={storeStatus === "open"}
                onChange={() => setStoreStatus("open")}
              />
              Open
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storeStatus"
                value="closed"
                checked={storeStatus === "closed"}
                onChange={() => setStoreStatus("closed")}
              />
              Closed
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="storeStatus"
                value="busy"
                checked={storeStatus === "busy"}
                onChange={() => setStoreStatus("busy")}
              />
              Busy / At Capacity
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button type="submit" className="button-style">
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
