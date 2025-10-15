import { faExpand, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FullOrder } from "./Orders";
import Image from "next/image";
import { useState } from "react";

interface OrdersModalProps {
  order: FullOrder | null;
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
  const [status, setStatus] = useState(order?.status || "Pending");
  const [loading, setLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  if (!order) return null;

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
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
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete order");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to delete order.");
    }
  };

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

  let seatCost = 0;

  if (order.startTime) {
    const start = new Date(order.startTime);
    let end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // default 2 hours
    const closingTime = new Date(start);
    closingTime.setHours(22, 0, 0, 0); // max end time 22:00
    if (end > closingTime) end = closingTime;

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    seatCost = hours * 10; // ₱10 per hour
  }

  // subtotal = sum of item prices
  const subtotal =
    order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ||
    0;

  return (
    <div
      className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/30 p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] p-6 rounded-3xl shadow-2xl border border-gray-200 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
          <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faTrash}
              className="text-red-500 cursor-pointer text-xl hover:text-red-600"
              onClick={deleteOrder}
            />
            <FontAwesomeIcon
              icon={faX}
              className="text-gray-500 cursor-pointer text-xl hover:text-gray-900"
              onClick={onClose}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Status Section */}
          <div className="flex flex-col gap-2">
            {status === "Canceled" ? (
              <div className="px-4 py-2 rounded-full font-semibold text-white bg-red-500 text-center">
                Canceled
              </div>
            ) : (
              <div className="flex gap-3">
                {STATUS_OPTIONS.map((opt, index) => {
                  const currentIndex = STATUS_OPTIONS.indexOf(status);
                  const isActive = status === opt;
                  const isNext = index === currentIndex + 1;

                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatus(opt);
                        updateStatus(opt);
                      }}
                      disabled={loading || (!isNext && !isActive)}
                      className={`flex-1 px-4 py-2 rounded-full font-semibold transition
                        ${
                          isActive
                            ? "bg-[#3C604C] text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }
                        ${statusColor(opt)}
                        disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-3 text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Order ID:</span>{" "}
              <span className="font-semibold text-gray-800">{order.id}</span>
            </p>
            <p>
              <span className="font-medium text-gray-900">Name:</span>{" "}
              <span className="font-semibold text-gray-800">
                {order.user?.name || "Unknown"}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-900">Subtotal:</span>{" "}
              <span className="font-semibold text-gray-800">
                ₱{subtotal.toFixed(2)}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-900">
                Reservation Fee:
              </span>{" "}
              <span className="font-semibold text-gray-800">
                ₱{seatCost.toFixed(2)}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-900">Total Amount:</span>{" "}
              <span className="font-semibold text-gray-800">
                ₱{order.totalAmount.toFixed(2)}
              </span>
            </p>
          </div>

          {/* Reservation Details */}
          <div className="mt-4">
            <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
              Reservation Details
            </h4>
            <div className="space-y-3 text-gray-700 bg-gray-50 p-5 rounded-xl border border-gray-200">
              <p>
                <span className="font-medium text-gray-800">
                  Selected Seat:
                </span>{" "}
                <span className="font-semibold text-gray-800">
                  {order.seats || "-"}
                </span>
              </p>
              {/* Optional guest count if available */}
              {order.guest && (
                <p>
                  <span className="font-medium text-gray-800">Guests:</span>{" "}
                  <span className="font-semibold text-gray-800">
                    {order.guest}
                  </span>
                </p>
              )}
              <p>
                <span className="font-medium text-gray-800">
                  Reservation Date:
                </span>{" "}
                <span className="font-semibold text-gray-800">
                  {order.time
                    ? new Date(order.time).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </span>
              </p>
              <p>
                <span className="font-medium text-gray-800">Time:</span>{" "}
                {order.startTime && order.endTime ? (
                  <span className="font-semibold text-gray-900">
                    {new Date(order.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(order.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : order.time ? (
                  <span className="font-semibold text-gray-900">
                    {new Date(order.time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                ) : (
                  "N/A"
                )}
              </p>
            </div>
          </div>

          {/* Pre-ordered Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Pre-Ordered Items
              </h4>
              <div className="flex flex-col gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {item.product.imageUrl && (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-lg cursor-pointer"
                          onClick={() =>
                            setExpandedImage(item.product.imageUrl ?? null)
                          }
                        />
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.size
                            ? `Size: ${item.size} | Qty: ${item.quantity}`
                            : `Qty: ${item.quantity}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-900 text-base">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Proof */}
          {order.paymentProof && (
            <div>
              <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Payment Proof
              </h4>
              <div className="relative w-full flex justify-center">
                <div className="relative w-full max-w-[260px]">
                  <Image
                    src={order.paymentProof}
                    alt="Payment Proof"
                    width={260}
                    height={260}
                    className="rounded-xl border border-gray-200 w-full h-auto object-cover cursor-pointer"
                    onClick={() => setExpandedImage(order.paymentProof ?? null)}
                  />

                  {/* Perfectly Rounded Expand Icon */}
                  <button
                    type="button"
                    className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center cursor-pointer bg-white/60 text-gray-700 border border-gray-300 rounded-full hover:bg-white hover:text-[#3C604C] transition-colors"
                    onClick={() => setExpandedImage(order.paymentProof ?? null)}
                  >
                    <FontAwesomeIcon icon={faExpand} className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Feedbacks */}
          {order.feedbacks && order.feedbacks.length > 0 && (
            <div>
              <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Customer Feedback
              </h4>
              <div className="flex flex-col gap-4">
                {order.feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-2xl"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                      <div className="flex justify-between">
                        <span>App Experience:</span>
                        <span>{fb.appExperience}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Order Completeness:</span>
                        <span>{fb.orderCompleteness}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speed of Service:</span>
                        <span>{fb.speedOfService}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Value for Money:</span>
                        <span>{fb.valueForMoney}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reservation Experience:</span>
                        <span>{fb.reservationExperience}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overall Satisfaction:</span>
                        <span>{fb.overallSatisfaction}/5</span>
                      </div>
                    </div>
                    {fb.overallReview && (
                      <p className="mt-4 p-3 bg-white rounded-2xl border-l-4 border-green-500 italic text-gray-800 text-sm">
                        {fb.overallReview}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expanded Image Modal */}
        {expandedImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <button
              className="fixed top-5 right-5 w-10 h-10 flex items-center justify-center bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-600"
              onClick={() => setExpandedImage(null)}
            >
              <FontAwesomeIcon icon={faX} className="text-lg" />
            </button>
            <div className="max-w-3xl max-h-[85vh] w-auto h-auto p-4 flex items-center justify-center">
              <Image
                src={expandedImage}
                alt="Expanded payment screenshot"
                width={800}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersModal;
