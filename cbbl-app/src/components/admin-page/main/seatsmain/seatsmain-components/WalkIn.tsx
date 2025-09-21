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

type Seat = { id: string; name: string; capacity: number };

type WalkIn = {
  id: string;
  startTime: string;
  endTime: string;
  seat?: Seat | null;
};

type OrderType = {
  id: string;
  seatId: string | null;
  startTime: string;
  endTime: string;
};

type WalkInProps = { selectedTime: string | null };

export default function WalkIn({ selectedTime }: WalkInProps) {
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string>>(
    {}
  );

  // Replace the fetchData inside useEffect with this
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch walk-ins
        const walkInsRes = await fetch(`/api/walkins`);
        if (!walkInsRes.ok) throw new Error("Failed to fetch walk-ins");
        const walkInsData = await walkInsRes.json();

        // Normalize walk-ins
        const walkInsArray: WalkIn[] = Array.isArray(walkInsData)
          ? walkInsData
          : walkInsData?.walkIns && Array.isArray(walkInsData.walkIns)
          ? walkInsData.walkIns
          : [];
        setWalkIns(walkInsArray);

        // Fetch orders
        const ordersRes = await fetch(`/api/orders`);
        if (!ordersRes.ok) throw new Error("Failed to fetch orders");
        const ordersData = await ordersRes.json();

        // Normalize orders
        const ordersArray: OrderType[] = Array.isArray(ordersData)
          ? ordersData
          : ordersData?.orders && Array.isArray(ordersData.orders)
          ? ordersData.orders
          : [];
        setOrders(ordersArray);

        // Initialize selected times
        const times: Record<string, string> = {};
        walkInsArray.forEach((w) => {
          times[w.id] = w.endTime;
        });
        setSelectedTimes(times);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTimeChange = (id: string, isoTime: string) => {
    setSelectedTimes((prev) => ({ ...prev, [id]: isoTime }));
  };

  const handleUpdate = async (id: string, seatId: string | undefined) => {
    const newEndTime = selectedTimes[id];
    if (!newEndTime) return;

    const startTime = walkIns.find((w) => w.id === id)?.startTime;
    if (!startTime) return;

    const newEndDate = new Date(newEndTime);
    const startDate = new Date(startTime);

    // Check for conflicts
    const conflict = isTimeReserved(seatId ?? null, newEndDate, startDate, id);
    if (conflict) {
      alert("This time conflicts with another reservation!");
      return;
    }

    try {
      const res = await fetch(`/api/walkins/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTime: newEndTime }),
      });
      if (!res.ok) throw new Error("Failed to update walk-in");

      const updated = await res.json();
      setWalkIns((prev) =>
        prev.map((w) => (w.id === id ? { ...w, endTime: updated.endTime } : w))
      );
      alert("Walk-in updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update walk-in");
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredWalkIns = selectedTime
    ? walkIns.filter((w) => {
        const sel = new Date(selectedTime);
        const start = new Date(w.startTime);
        const end = new Date(w.endTime);
        return sel >= start && sel < end;
      })
    : walkIns.filter((w) => {
        const start = new Date(w.startTime);
        const day = new Date(start);
        day.setHours(0, 0, 0, 0);
        return day.getTime() === today.getTime();
      });

  const isTimeReserved = (
    seatId: string | null,
    newEndTime: Date,
    startTime: Date,
    currentId: string
  ) => {
    if (!seatId) return false;

    // Check walk-ins
    const walkInConflict = walkIns.some((w) => {
      if (w.id === currentId) return false;
      if (w.seat?.id !== seatId) return false;

      const wStart = new Date(w.startTime);
      const wEnd = new Date(w.endTime);
      return startTime < wEnd && newEndTime > wStart;
    });

    // Check orders
    const orderConflict = orders.some((o) => {
      if (!o.seatId || o.seatId !== seatId) return false;

      const oStart = new Date(o.startTime);
      const oEnd = new Date(o.endTime);
      return startTime < oEnd && newEndTime > oStart;
    });

    return walkInConflict || orderConflict;
  };

  let message: string | null = null;
  if (loading) message = "Loading...";
  else if (error) message = error;
  else if (filteredWalkIns.length === 0)
    message = "No walk-ins found for today";

  return (
    <div className="products-card">
      <h1 className="text-2xl mb-6">Walk-In Info</h1>
      {message && (
        <p className={error ? "text-red-500 mb-4" : "text-gray-500 mb-4"}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredWalkIns.map((w) => {
          const now = new Date();
          const startTime = new Date(w.startTime);
          const selectedTimeValue = selectedTimes[w.id] || "";

          return (
            <div
              key={w.id}
              className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {w.seat?.name ?? "N/A"}
                </h2>
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
                  htmlFor={`endTime-${w.id}`}
                  className="text-gray-700 font-medium mb-2 block"
                >
                  End Time
                </label>
                <div className="relative">
                  <select
                    id={`endTime-${w.id}`}
                    value={selectedTimeValue}
                    onChange={(e) => handleTimeChange(w.id, e.target.value)}
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
                        w.seat?.id ?? null,
                        timeDate,
                        startTime,
                        w.id
                      );

                      return (
                        <option
                          key={time}
                          value={isoTime}
                          disabled={isPast || reserved || timeDate <= startTime}
                        >
                          {time}{" "}
                          {isPast || reserved || timeDate <= startTime
                            ? "(Unavailable)"
                            : ""}
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
                onClick={() => handleUpdate(w.id, w.seat?.id)}
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
