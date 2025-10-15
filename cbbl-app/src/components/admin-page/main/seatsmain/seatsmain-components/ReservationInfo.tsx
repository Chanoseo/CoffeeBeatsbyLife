"use client";

import { useEffect, useState } from "react";

type OrderSeat = {
  id: string;
  startTime: string;
  endTime: string;
  seat?: { name: string } | null;
};

type Order = {
  id: string;
  startTime: string;
  endTime: string;
  status?: string;
  user: { name: string };
  seats?: string | null;
  seatName?: string;
  orderSeats?: OrderSeat[];
};

type FlatSeat = {
  orderId: string;
  orderSeatId: string;
  startTime: string;
  endTime: string;
  status?: string;
  user: { name: string };
  seatName?: string | null;
};

type ReservationInfoProps = {
  selectedTime: string | null;
};

function formatISOToHHMM(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = `${d.getHours()}`.padStart(2, "0");
  const mm = `${d.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mm}`;
}

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

        // --- CHANGED: populate selectedTimes per orderSeat id, fallback to synthetic legacy keys ---
        const times: Record<string, string> = {};
        data.forEach((order: Order) => {
          if (order.orderSeats && order.orderSeats.length > 0) {
            order.orderSeats.forEach((os) => {
              times[os.id] = os.endTime;
            });
          } else {
            // legacy: multiple seats stored as comma string or single seatName
            const seatList = order.seats
              ? order.seats.split(",").map((s) => s.trim())
              : [order.seatName ?? "N/A"];
            seatList.forEach((_, idx) => {
              times[`${order.id}-${idx}`] = order.endTime;
            });
            // also keep order-level fallback key for single-seat legacy consumers
            times[order.id] = order.endTime;
          }
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
    seatNames: string | null,
    checkEndTime: Date,
    currentStartTime: Date,
    currentOrderId: string
  ) => {
    if (!seatNames) return false;
    const seatList = seatNames.split(",").map((s) => s.trim());
    return orders.some((order) => {
      if (!order.seats || order.id === currentOrderId) return false;

      const otherSeatList = order.seats.split(",").map((s) => s.trim());
      const overlap = seatList.some((s) => otherSeatList.includes(s));

      if (!overlap) return false;

      const otherStart = new Date(order.startTime);
      const otherEnd = new Date(order.endTime);
      return currentStartTime < otherEnd && checkEndTime > otherStart;
    });
  };

  const handleUpdate = async (orderId: string, orderSeatId: string) => {
    // use orderSeatId key (per-seat) first, fallback to orderId (legacy)
    const newEndTime = selectedTimes[orderSeatId] ?? selectedTimes[orderId];
    if (!newEndTime) return;

    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const seat = order.orderSeats?.find((s) => s.id === orderSeatId);

    const startTime = seat
      ? new Date(seat.startTime)
      : new Date(order.startTime);
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
      order.seats ?? null,
      endTime,
      startTime,
      order.id
    );
    if (conflict) {
      alert("This end time overlaps another reservation on the same seat.");
      return;
    }

    try {
      // --- CHANGED: send orderSeatId so backend updates only that OrderSeat ---
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderSeatId, endTime: newEndTime }),
      });

      if (!res.ok) throw new Error("Failed to update order");

      const updatedSeat = await res.json();

      // update local state: only update the specific orderSeat endTime
      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o;
          if (!o.orderSeats) return o;
          return {
            ...o,
            orderSeats: o.orderSeats.map((os) =>
              os.id === updatedSeat.id
                ? { ...os, endTime: updatedSeat.endTime }
                : os
            ),
          };
        })
      );

      // keep selectedTimes in-sync for that seat key
      setSelectedTimes((prev) => ({
        ...prev,
        [orderSeatId]: updatedSeat.endTime,
      }));

      alert(
        `Order updated successfully! New end time: ${new Date(
          updatedSeat.endTime
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

  // ✅ Show only today's order seats (per-seat filtering)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 🔹 Flatten first, then filter each seat reservation individually
  const allSeats: FlatSeat[] = orders.flatMap((order) => {
    if (order.orderSeats && order.orderSeats.length > 0) {
      return order.orderSeats.map((os) => ({
        orderId: order.id,
        orderSeatId: os.id,
        startTime: os.startTime,
        endTime: os.endTime,
        status: order.status,
        user: order.user,
        seatName: os.seat?.name ?? null,
      }));
    }

    // legacy fallback
    const seatList = order.seats
      ? order.seats.split(",").map((s) => s.trim())
      : [order.seatName ?? "N/A"];

    return seatList.map((seatName, idx) => ({
      orderId: order.id,
      orderSeatId: `${order.id}-${idx}`,
      startTime: order.startTime,
      endTime: order.endTime,
      status: order.status,
      user: order.user,
      seatName,
    }));
  });

  // ✅ Filter per-seat basis (not by whole order)
  const filteredSeats = allSeats.filter((seat) => {
    // skip canceled
    if (seat.status === "Canceled") return false;

    const seatStart = new Date(seat.startTime);
    const seatEnd = new Date(seat.endTime);
    const seatDay = new Date(seatStart);
    seatDay.setHours(0, 0, 0, 0);

    // only show today's seats
    if (seatDay.getTime() !== today.getTime()) return false;

    // if a specific selectedTime is chosen, check if it overlaps with this seat
    if (selectedTime) {
      const selected = new Date(selectedTime);
      const selectedEnd = new Date(selected);
      selectedEnd.setHours(selected.getHours() + 1);
      return seatStart < selectedEnd && seatEnd > selected;
    }

    // default: show ongoing or future reservations today
    return seatEnd > new Date();
  });

  // ✅ Final flattened list (filtered per seat)
  const flattenedOrders = filteredSeats;

  // ✅ Message handling
  let message: string | null = null;
  if (loading) {
    message = "Loading...";
  } else if (error) {
    message = error;
  } else if (flattenedOrders.length === 0) {
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
        {flattenedOrders.map((order) => {
          const startTime = new Date(order.startTime);

          return (
            <div
              key={`${order.orderId}-${order.orderSeatId}`}
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
                  {order.seatName ?? "N/A"}
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
                  htmlFor={`endTime-${order.orderSeatId}`}
                  className="text-gray-700 font-medium mb-2 block"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id={`endTime-${order.orderSeatId}`}
                  value={formatISOToHHMM(
                    selectedTimes[order.orderSeatId] ?? order.endTime
                  )}
                  min="10:00"
                  max="22:00"
                  step={300}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    const start = new Date(order.startTime);
                    const timeDate = new Date(
                      start.getFullYear(),
                      start.getMonth(),
                      start.getDate(),
                      hours,
                      minutes
                    );
                    handleTimeChange(order.orderSeatId, timeDate.toISOString());
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800"
                />
              </div>

              <button
                className="w-full button-style"
                onClick={() => handleUpdate(order.orderId, order.orderSeatId)}
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
                          // synthetic id (fallback) -> update order-level endTime
                          if (order.orderSeatId.includes("-")) {
                            const res = await fetch(
                              `/api/orders/${order.orderId}`,
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  endTime: currentTimeIso,
                                }),
                              }
                            );

                            if (!res.ok)
                              throw new Error("Failed to update order");

                            const updatedOrder = await res.json();

                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.orderId
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
                            return;
                          }

                          // Per-seat update: send orderSeatId so backend updates only that OrderSeat
                          const res = await fetch(
                            `/api/orders/${order.orderId}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                orderSeatId: order.orderSeatId,
                                endTime: currentTimeIso,
                              }),
                            }
                          );

                          if (!res.ok)
                            throw new Error("Failed to update order seat");

                          const updatedSeat = await res.json();

                          // update only the seat's endTime in local state
                          setOrders((prev) =>
                            prev.map((o) =>
                              o.id === order.orderId
                                ? {
                                    ...o,
                                    orderSeats: o.orderSeats?.map((os) =>
                                      os.id === updatedSeat.id
                                        ? {
                                            ...os,
                                            endTime: updatedSeat.endTime,
                                          }
                                        : os
                                    ),
                                  }
                                : o
                            )
                          );

                          // sync selectedTimes for this seat
                          setSelectedTimes((prev) => ({
                            ...prev,
                            [order.orderSeatId]: updatedSeat.endTime,
                          }));

                          alert(
                            `Order seat marked as done at ${new Date(
                              updatedSeat.endTime
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
