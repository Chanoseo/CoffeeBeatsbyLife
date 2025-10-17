"use client";

import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  faClock,
  faCheckCircle,
  faUtensils,
  faBoxOpen,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type OrderSeat = {
  seat: { id: string; name: string };
  startTime: string;
  endTime: string;
};

type OrderItem = {
  product: { name: string; price: number; imageUrl: string };
  quantity: number;
  price: number;
  size?: string;
};

type Order = {
  id: string;
  orderSeats: OrderSeat[];
  seat: { id: string; name: string } | null;
  time: string | null;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  guest: number;
  startTime: string;
  endTime: string;
};

function OrderDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("id") ?? null;
  const [order, setOrder] = useState<Order | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      }
    };

    fetchOrder(); // initial fetch

    // Poll every 3 seconds for real-time updates
    const interval = setInterval(fetchOrder, 3000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [orderId]);

  if (!order)
    return (
      <p className="text-center mt-6 text-gray-500">Loading order details...</p>
    );

  const statusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    Preparing: "bg-purple-100 text-purple-700 border-purple-200",
    Ready: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
    Canceled: "bg-red-100 text-red-700 border-red-200",
  };

  const getBannerMessage = (status: string) => {
    switch (status) {
      case "Pending":
        return "Your payment is being verified. Please wait for confirmation from our staff.";
      case "Confirmed":
        return "Your reservation is confirmed! We’ll start preparing your food 30 minutes before your scheduled time.";
      case "Preparing":
        return "Your order is now being prepared and will be ready shortly.";
      case "Ready":
        return "Your order is ready! Please arrive at your reserved time to enjoy your meal.";
      case "Completed":
        return "Thank you for dining with us! Your order is completed.";
      case "Canceled":
        return "Your order has been canceled.";
      default:
        return null;
    }
  };

  const steps = [
    { status: "Pending", label: "Pending", icon: faClock },
    { status: "Confirmed", label: "Confirmed", icon: faCheckCircle },
    { status: "Preparing", label: "Preparing", icon: faUtensils },
    { status: "Ready", label: "Ready", icon: faBoxOpen },
    { status: "Completed", label: "Completed", icon: faCheckCircle },
  ];

  const downloadConfirmation = async () => {
    if (!order || isDownloading) return;

    setIsDownloading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/receipt`);
      if (!res.ok) return alert("Failed to download confirmation");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `confirmation-${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download confirmation.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <UserPageHeader />

      <main className="px-4 py-10 md:px-10 md:py-20 lg:px-40 lg:py-25 space-y-6 bg-white">
        {/* Progress Icons Section */}
        <section className="flex flex-wrap justify-center gap-4 md:gap-6 py-4">
          {steps.map((step, index) => {
            const isActive = order.status === step.status;
            const currentIndex = steps.findIndex(
              (s) => s.status === order.status
            );
            const isCompleted = currentIndex > index;

            let stepStyle = "border-gray-300 text-gray-400 bg-white";
            if (isCompleted) {
              stepStyle = "bg-green-100 text-green-700 border-green-200";
            } else if (isActive) {
              stepStyle = statusStyles[step.status];
            }

            const textColor = isCompleted
              ? "text-green-700"
              : isActive
              ? stepStyle.split(" ").find((cls) => cls.startsWith("text-"))
              : "text-gray-400";

            return (
              <div
                key={step.status}
                className="flex items-center gap-2 md:gap-6 mb-4 md:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition ${stepStyle}`}
                  >
                    <FontAwesomeIcon
                      icon={step.icon}
                      className="w-4 h-4 md:w-6 md:h-6"
                    />
                  </div>
                  <p
                    className={`mt-1 md:mt-2 text-xs md:text-sm font-medium text-center w-16 md:w-20 truncate ${textColor}`}
                  >
                    {step.label}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center gap-1 text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Reservation Banner */}
        {getBannerMessage(order.status) && (
          <section
            className={`rounded-2xl p-5 border ${
              statusStyles[order.status]
            } shadow-sm text-center`}
          >
            <h2 className="text-lg font-semibold">
              {getBannerMessage(order.status)}
            </h2>
          </section>
        )}

        {(order.status === "Pending" || order.status === "Confirmed") && (
          <section className="w-full bg-yellow-100 border border-yellow-200 shadow-sm text-center rounded-2xl p-5">
            <p className="text-md text-yellow-700 text-center font-medium">
              <span className="font-semibold">Note:</span> Cancellation of an
              order is only permitted while the status is
              <span className="font-semibold"> Pending </span> or{" "}
              <span className="font-semibold"> Confirmed</span>.
            </p>
          </section>
        )}

        {/* Order Info Card */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
            <div className="flex md:items-center gap-4 mt-4 md:mt-0 flex-col-reverse md:flex-row">
              {order.status !== "Pending" && order.status !== "Canceled" && (
                <button
                  onClick={downloadConfirmation}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                  disabled={isDownloading}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  {isDownloading ? "Downloading..." : "Download Confirmation"}
                </button>
              )}

              {/* Cancel Button */}
              {(order.status === "Pending" || order.status === "Confirmed") && (
                <>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 text-center"
                  >
                    Cancel Order
                  </button>

                  {showCancelModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                          Cancel Order
                        </h2>
                        <p className="text-gray-600 mb-6">
                          Are you sure you want to cancel this order? This
                          action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowCancelModal(false)}
                            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                          >
                            No, Keep Order
                          </button>
                          <button
                            onClick={async () => {
                              if (isCancelling) return; // prevent multiple clicks

                              setIsCancelling(true);

                              try {
                                const res = await fetch(
                                  `/api/orders/${order.id}`,
                                  {
                                    method: "PUT",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      status: "Canceled",
                                    }),
                                  }
                                );

                                if (!res.ok)
                                  throw new Error("Failed to cancel order");

                                setOrder({ ...order, status: "Canceled" });
                                setShowCancelModal(false);
                              } catch (err) {
                                console.error(err);
                                alert("Failed to cancel order.");
                              } finally {
                                setIsCancelling(false);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                            disabled={isCancelling}
                          >
                            {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Status Badge */}
              <span
                className={`px-3 py-1.5 rounded-full text-center text-sm font-medium border ${
                  statusStyles[order.status]
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Order ID</span>
              <span className="text-gray-800 font-medium break-all">
                {order.id}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total Amount</span>
              <span className="text-lg font-semibold text-gray-800">
                ₱{order.totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Seats</span>
              {order.orderSeats && order.orderSeats.length > 0 ? (
                <span className="text-gray-800 font-medium">
                  {order.orderSeats.map((os) => os.seat.name).join(", ")}
                </span>
              ) : (
                <span className="text-gray-500">No seats selected</span>
              )}
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Reservation Fee</span>
              <span className="text-gray-800 font-medium">
                ₱{" "}
                {(() => {
                  if (!order.startTime || !order.endTime) return "0.00";
                  const start = new Date(order.startTime);
                  const end = new Date(order.endTime);

                  // calculate hours, capped at 10 PM if needed
                  const closingTime = new Date(start);
                  closingTime.setHours(22, 0, 0, 0); // 10 PM
                  const finalEnd = end > closingTime ? closingTime : end;

                  const hours =
                    (finalEnd.getTime() - start.getTime()) / (1000 * 60 * 60);
                  return (hours * 10).toFixed(2); // ₱10 per hour
                })()}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Guest</span>
              <span className="text-gray-800 font-medium">{order.guest}</span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Reservation Date</span>
              <span className="text-gray-800 font-medium">
                {order.time
                  ? new Date(order.time).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not selected"}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Start Time</span>
              <span className="text-gray-800 font-medium">
                {new Date(order.startTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">End Time</span>
              <span className="text-gray-800 font-medium">
                {new Date(order.endTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </section>

        {/* Order Items */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Pre-Ordered Items
          </h2>
          <div className="overflow-x-auto md:overflow-x-visible scrollbar-hide">
            <div className="flex md:grid md:grid-cols-1 md:gap-4 gap-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-64 md:w-full flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-xl"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-full md:w-16 md:h-16 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={250}
                        height={250}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Qty: {item.quantity} {item.size && `(${item.size})`}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800 mt-2 md:mt-0">
                    ₱{item.price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <UserPageFooter />
    </>
  );
}

export default OrderDetails;
