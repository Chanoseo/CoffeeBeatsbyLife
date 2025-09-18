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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type OrderItem = {
  product: { name: string; price: number; imageUrl: string };
  quantity: number;
  price: number;
  size?: string;
};

type Order = {
  id: string;
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

  const statusStyles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    Preparing: "bg-purple-100 text-purple-700 border-purple-200",
    Ready: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Completed: "bg-green-100 text-green-700 border-green-200",
  };

  const getBannerMessage = (status: string) => {
    switch (status) {
      case "Pending":
        return "Your reservation has been received. Your table is secured.";
      case "Confirmed":
        return "Your order has been confirmed. Preparation will begin shortly.";
      case "Preparing":
        return "Your order is currently being prepared.";
      case "Ready":
        return "Your order is ready to be served.";
      case "Completed":
        return "Your order is completed. Thank you for dining with us.";
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

  return (
    <>
      <UserPageHeader />

      <main className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Progress Icons Section */}
        <section className="flex items-center justify-center gap-6">
          {steps.map((step, index) => {
            const isActive = order.status === step.status;
            const currentIndex = steps.findIndex(
              (s) => s.status === order.status
            );
            const isCompleted = currentIndex > index;

            // Style logic
            let stepStyle = "border-gray-300 text-gray-400 bg-white"; // upcoming
            if (isCompleted) {
              stepStyle = "bg-green-100 text-green-700 border-green-200"; // completed → green
            } else if (isActive) {
              stepStyle = statusStyles[step.status]; // active → use statusStyles
            }

            // Label text color
            const textColor = isCompleted
              ? "text-green-700"
              : isActive
              ? stepStyle.split(" ").find((cls) => cls.startsWith("text-"))
              : "text-gray-400";

            return (
              <div key={step.status} className="flex items-center gap-6">
                {/* Step Icon */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition ${stepStyle}`}
                  >
                    <FontAwesomeIcon icon={step.icon} className="w-6 h-6" />
                  </div>
                  <p
                    className={`mt-2 text-xs font-medium text-center w-20 truncate ${textColor}`}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Always show dots between steps */}
                {index < steps.length - 1 && (
                  <div className="flex items-center gap-1 text-gray-400">
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

        {/* Order Info Card */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                statusStyles[order.status]
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-lg font-semibold text-gray-800">
                ₱{order.totalAmount.toFixed(2)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Seat</p>
              <p className="text-gray-800 font-medium">
                {order.seat?.name ?? "Not selected"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Guest</p>
              <p className="text-gray-800 font-medium">{order.guest}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Reservation Time</p>
              <p className="text-gray-800 font-medium">
                {order.time
                  ? new Date(order.time).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not selected"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Start Time</p>
              <p className="text-gray-800 font-medium">
                {new Date(order.startTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">End Time</p>
              <p className="text-gray-800 font-medium">
                {new Date(order.endTime).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </section>

        {/* Order Items */}
        <section className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Pre-Ordered Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-xl hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
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
                      Qty: {item.quantity} {item.size && `(${item.size})`}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-gray-800">
                  ₱{item.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <UserPageFooter />
    </>
  );
}

export default OrderDetails;
