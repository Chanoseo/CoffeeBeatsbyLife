"use client";

import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type OrderItem = {
  product: { name: string; price: number; imageUrl: string };
  quantity: number;
  price: number;
  size?: string; // ✅ add size
};

type Order = {
  id: string;
  seat: { id: string; name: string } | null; // ✅ seat object
  time: string | null;
  totalAmount: number;
  status: string;
  items: OrderItem[];
};

function OrderDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (!order)
    return (
      <p className="text-center mt-6 text-gray-500">Loading order details...</p>
    );

  const statusColor =
    order.status === "Pending"
      ? "bg-yellow-100 text-yellow-800"
      : order.status === "Confirmed"
      ? "bg-blue-100 text-blue-800"
      : order.status === "Preparing"
      ? "bg-purple-100 text-purple-800"
      : order.status === "Ready"
      ? "bg-indigo-100 text-indigo-800"
      : order.status === "Completed"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  // Helper for banner background
  const getRowColor = (status: string) =>
    ({
      Pending: "bg-yellow-50",
      Confirmed: "bg-blue-50",
      Preparing: "bg-purple-50",
      Ready: "bg-indigo-50",
      Completed: "bg-green-50",
    }[status] || "bg-white");

  // Banner message depending on status
  const getBannerMessage = (status: string) => {
    switch (status) {
      case "Pending":
        return "Your reservation has been received. Your table is secured and your order has been recorded.";
      case "Confirmed":
        return "Your order has been confirmed. Preparation will begin shortly.";
      case "Preparing":
        return "Your order is currently being prepared. We kindly ask for your patience.";
      case "Ready":
        return "Your order is ready for serving. Please proceed when convenient.";
      case "Completed":
        return "Your order has been successfully completed. Thank you for dining with us.";
      default:
        return null;
    }
  };

  const bannerMessage = getBannerMessage(order.status);

  return (
    <>
      <UserPageHeader />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Reservation Banner (only if message exists) */}
        {bannerMessage && (
          <div
            className={`${getRowColor(
              order.status
            )} border border-gray-200 rounded-xl p-4 text-center`}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              {bannerMessage}
            </h2>
            {order.status === "Pending" && (
              <p className="text-gray-700 text-sm">
                We look forward to welcoming you to Coffee Beats by Life.
              </p>
            )}
          </div>
        )}

        {/* Order Info Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Order Details
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 font-medium mb-1">Status:</p>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Total Amount:</p>
              <p className="font-semibold text-gray-800 text-lg">
                ₱{order.totalAmount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Seat:</p>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                {order.seat?.name ?? "Not selected"}
              </span>
            </div>
            <div>
              <p className="text-gray-600 font-medium mb-1">Time:</p>
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                {order.time
                  ? new Date(order.time).toLocaleString()
                  : "Not selected"}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Pre-Ordered Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.product.name}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Quantity: {item.quantity}{" "}
                      {item.size ? `(${item.size})` : ""}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">
                  ₱{item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <UserPageFooter />
    </>
  );
}

export default OrderDetails;
