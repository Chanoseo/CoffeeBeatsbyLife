"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  startTime: string;
  endTime: string;
  status?: string;
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
    let firstLoad = true;

    const fetchOrders = async () => {
      if (firstLoad) setLoading(true); // ✅ only show loading on first run
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
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders");
      } finally {
        if (firstLoad) {
          setLoading(false);
          firstLoad = false; // ✅ prevent future loading flashes
        }
      }
    };

    fetchOrders();

    // 🔁 Auto-refresh every 5 seconds
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleTimeChange = (orderId: string, isoTime: string) => {
    setSelectedTimes((prev) => ({ ...prev, [orderId]: isoTime }));
  };

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

  const handleUpdate = async (orderId: string) => {
    const newEndTime = selectedTimes[orderId];
    if (!newEndTime) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const startTime = new Date(order.startTime);
    const endTime = new Date(newEndTime);

    // ✅ VALIDATIONS moved to Update button
    const minTime = new Date(startTime);
    minTime.setHours(10, 0, 0, 0);
    const maxTime = new Date(startTime);
    maxTime.setHours(22, 0, 0, 0);

    if (endTime <= startTime) {
      alert("End time must be later than the reservation's start time.");
      return;
    }

    if (endTime < minTime || endTime > maxTime) {
      alert("Please select an end time between 10:00 AM and 10:00 PM.");
      return;
    }

    const conflict = isTimeReserved(
      order.seat ?? null,
      endTime,
      startTime,
      order.id
    );
    if (conflict) {
      alert("This end time overlaps another reservation on the same seat.");
      return;
    }

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

      alert(
        `Order updated successfully! New end time: ${new Date(
          updatedOrder.endTime
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  // ✅ Show only today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredOrders = orders.filter((order) => {
    // 🟡 Skip canceled orders
    if (order.status === "Canceled") return false;

    const start = new Date(order.startTime);
    const end = new Date(order.endTime);

    if (selectedTime) {
      const selected = new Date(selectedTime);
      const selectedEnd = new Date(selected);
      selectedEnd.setHours(selected.getHours() + 1);

      // ✅ Check overlap just like getSeatStatus()
      const overlaps = start < selectedEnd && end > selected;
      return overlaps;
    }

    // ✅ If no selected time, show only today's ongoing/future orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderDay = new Date(start);
    orderDay.setHours(0, 0, 0, 0);

    return (
      orderDay.getTime() === today.getTime() &&
      new Date(order.endTime) > new Date() // This hides done/past orders
    );
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
          const startTime = new Date(order.startTime);

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm"
            >
              <div className="mb-4 flex-grow">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {order.user.name}
                </h2>
                {(order.status === "Completed" ||
                  new Date() > new Date(order.endTime)) && (
                  <p
                    className={`text-sm text-white p-2 font-bold mb-2 text-center rounded-sm ${
                      new Date() > new Date(order.endTime)
                        ? "bg-green-500"
                        : "bg-blue-500"
                    }`}
                  >
                    {new Date() > new Date(order.endTime) ? "Done" : "Occupied"}
                  </p>
                )}
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
                <input
                  type="time"
                  id={`endTime-${order.id}`}
                  value={
                    selectedTimes[order.id]
                      ? new Date(selectedTimes[order.id]).toLocaleTimeString(
                          [],
                          {
                            hour12: false,
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )
                      : ""
                  }
                  min="10:00"
                  max="22:00"
                  step={300}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    const startTime = new Date(order.startTime);
                    const timeDate = new Date(
                      startTime.getFullYear(),
                      startTime.getMonth(),
                      startTime.getDate(),
                      hours,
                      minutes
                    );
                    handleTimeChange(order.id, timeDate.toISOString());
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800"
                />
              </div>

              <button
                className="w-full button-style"
                onClick={() => handleUpdate(order.id)}
              >
                Update
              </button>
              {(() => {
                const now = new Date();
                const start = new Date(order.startTime);
                const end = new Date(order.endTime);

                // Show "Done" button only if current time is between start and end
                if (now >= start && now <= end) {
                  return (
                    <button
                      className="w-full mt-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                      onClick={async () => {
                        const currentTimeIso = new Date().toISOString();
                        try {
                          const res = await fetch(`/api/orders/${order.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ endTime: currentTimeIso }),
                          });

                          if (!res.ok)
                            throw new Error("Failed to update order");

                          const updatedOrder = await res.json();

                          setOrders((prev) =>
                            prev.map((o) =>
                              o.id === order.id
                                ? { ...o, endTime: updatedOrder.endTime }
                                : o
                            )
                          );

                          alert(
                            `Order marked as done at ${new Date(
                              updatedOrder.endTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          );
                        } catch (err) {
                          console.error(err);
                          alert("Failed to mark order as done");
                        }
                      }}
                    >
                      Mark as Done
                    </button>
                  );
                }
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}
