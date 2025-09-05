import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FullOrder } from "./Orders";
import Image from "next/image";
import { useState } from "react";

interface OrdersModalProps {
  order: FullOrder | null; // make it nullable to match the check
  onClose: () => void;
}

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
];

function OrdersModal({ order, onClose }: OrdersModalProps) {
  // hooks must always run before any early return
  const [status, setStatus] = useState(order?.status || "Pending");
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const timeStr = order.time
    ? new Date(order.time).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "-";

  const updateStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      // ✅ Reload the page after successful update
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async () => {
    if (!order) return;

    if (!confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete order");

      // ✅ Reload after deletion
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/30 p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full max-w-2xl p-6 rounded-2xl shadow-xl border border-gray-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
          <div>
            <FontAwesomeIcon icon={faTrash} onClick={deleteOrder} />
            <FontAwesomeIcon
              icon={faX}
              className="ml-4 text-gray-600"
              onClick={onClose}
            />
          </div>
        </div>

        {/* Order Info */}
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-semibold">Order ID:</span>{" "}
            {order.displayId || order.id}
          </p>
          <p>
            <span className="font-semibold">Customer Name:</span>{" "}
            {order.user?.name || "Unknown"}
          </p>
          <p>
            <span className="font-semibold">Total Amount:</span> ₱
            {order.totalAmount.toFixed(2)}
          </p>
          <p>
            <span className="font-semibold">Seat:</span> {order.seat || "-"}
          </p>
          <p>
            <span className="font-semibold">Reservation Time:</span> {timeStr}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-semibold">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`px-2 py-1 rounded-md border ${statusColor(status)}`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              onClick={updateStatus}
              disabled={loading || status === order.status}
              className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-300"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Pre-ordered Items */}
        {order.items && order.items.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Pre-Ordered Items:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.product.name} x {item.quantity}
                  {item.size ? ` (${item.size})` : ""} - ₱
                  {(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Payment Proof */}
        {order.paymentProof && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Payment Proof:</p>
            <Image
              src={order.paymentProof}
              alt="Payment Proof"
              width={300}
              height={300}
              className="w-full max-h-64 object-contain rounded-lg border"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Helper to style status select border colors
const statusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "border-yellow-400";
    case "Confirmed":
      return "border-blue-400";
    case "Preparing":
      return "border-purple-400";
    case "Ready":
      return "border-indigo-400";
    case "Completed":
      return "border-green-400";
    default:
      return "border-gray-300";
  }
};

export default OrdersModal;
