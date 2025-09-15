"use client";

import { useEffect, useState } from "react";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const timeOptions = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
];

type Order = {
  id: string;
  startTime: string;
  endTime: string;
  user: { name: string };
  seat?: string | null;
};

type ReservationInfoProps = {
  selectedTime: string | null;
};

export default function ReservationInfo({
  selectedTime,
}: ReservationInfoProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);

        const times: Record<string, string> = {};
        data.forEach((order: Order) => {
          times[order.id] = order.endTime;
        });
        setSelectedTimes(times);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleTimeChange = (orderId: string, isoTime: string) => {
    setSelectedTimes((prev) => ({ ...prev, [orderId]: isoTime }));
  };

  const handleUpdate = async (orderId: string) => {
    const newEndTime = selectedTimes[orderId];
    if (!newEndTime) return;

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTime: newEndTime }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      const updatedOrder = await res.json();

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, endTime: updatedOrder.endTime }
            : order
        )
      );

      alert("Order updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  // ✅ Show only today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredOrders = selectedTime
    ? orders.filter((order) => {
        const sel = new Date(selectedTime);
        const start = new Date(order.startTime);
        const end = new Date(order.endTime);
        return sel >= start && sel < end;
      })
    : orders.filter((order) => {
        const start = new Date(order.startTime);
        const orderDay = new Date(start);
        orderDay.setHours(0, 0, 0, 0);
        return orderDay.getTime() === today.getTime();
      });

  // ✅ Message handling
  let message: string | null = null;
  if (loading) {
    message = "Loading...";
  } else if (error) {
    message = error;
  } else if (filteredOrders.length === 0) {
    message = "No orders found for today";
  }

  const isTimeReserved = (
    seat: string | null,
    checkEndTime: Date,
    currentStartTime: Date,
    currentOrderId: string
  ) => {
    return orders.some((order) => {
      if (!order.seat || order.id === currentOrderId) return false;
      if (order.seat !== seat) return false;

      const otherStart = new Date(order.startTime);
      const otherEnd = new Date(order.endTime);

      return currentStartTime < otherEnd && checkEndTime > otherStart;
    });
  };

  return (
    <div className="products-card">
      <h1 className="text-2xl mb-6">Reservation Info</h1>
      {message && (
        <p className={error ? "text-red-500 mb-4" : "text-gray-500 mb-4"}>
          {message}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredOrders.map((order) => {
          const now = new Date();
          const startTime = new Date(order.startTime);
          const selectedTime = selectedTimes[order.id] || "";

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {order.user.name}
                </h2>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Seat:</span>{" "}
                  {order.seat ?? "N/A"}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Date:</span>{" "}
                  {startTime.toLocaleDateString()}
                </p>
                <p className="text-gray-500 text-sm mb-1">
                  <span className="font-medium">Start:</span>{" "}
                  {startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="mb-4">
                <label
                  htmlFor={`endTime-${order.id}`}
                  className="text-gray-700 font-medium mb-2 block"
                >
                  End Time
                </label>
                <div className="relative">
                  <select
                    id={`endTime-${order.id}`}
                    value={selectedTime}
                    onChange={(e) => handleTimeChange(order.id, e.target.value)}
                    className="w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none appearance-none text-gray-800"
                  >
                    <option value="">-- Select End Time --</option>
                    {timeOptions.map((time) => {
                      const [timePart, modifier] = time.split(" ");
                      const [hourStr, minuteStr] = timePart.split(":");
                      let hours = Number(hourStr);
                      const minutes = Number(minuteStr);

                      if (modifier === "PM" && hours < 12) hours += 12;
                      if (modifier === "AM" && hours === 12) hours = 0;

                      const timeDate = new Date(
                        startTime.getFullYear(),
                        startTime.getMonth(),
                        startTime.getDate(),
                        hours,
                        minutes
                      );

                      const isoTime = timeDate.toISOString();
                      const isPast = timeDate < now;
                      const reserved = isTimeReserved(
                        order.seat ?? null,
                        timeDate,
                        startTime,
                        order.id
                      );

                      // Disable if it's past, reserved, or <= startTime
                      const disableOption =
                        isPast || reserved || timeDate <= startTime;

                      return (
                        <option
                          key={time}
                          value={isoTime}
                          disabled={disableOption}
                        >
                          {time} {disableOption ? "(Unavailable)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <button
                className="w-full button-style"
                onClick={() => handleUpdate(order.id)}
              >
                Update
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
