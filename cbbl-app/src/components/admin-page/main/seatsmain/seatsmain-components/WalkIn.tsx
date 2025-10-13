"use client";

import { useEffect, useState } from "react";

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
    let firstLoad = true;

    const fetchData = async () => {
      if (firstLoad) setLoading(true); // only show loader on initial fetch
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
        if (firstLoad) {
          setLoading(false);
          firstLoad = false; // prevents future flickers
        }
      }
    };

    fetchData();
    // 🔁 Real-time auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleTimeChange = (id: string, isoTime: string) => {
    setSelectedTimes((prev) => ({ ...prev, [id]: isoTime }));
  };

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

  const handleUpdate = async (id: string, seatId: string | undefined) => {
    const newEndTime = selectedTimes[id];
    if (!newEndTime) return;

    const walkIn = walkIns.find((w) => w.id === id);
    if (!walkIn) return;

    const startTime = new Date(walkIn.startTime);
    const endTime = new Date(newEndTime);

    // Operating hours 10AM–10PM
    const minTime = new Date(startTime);
    minTime.setHours(10, 0, 0, 0);
    const maxTime = new Date(startTime);
    maxTime.setHours(22, 0, 0, 0);

    // 1️⃣ End must be after start
    if (endTime <= startTime) {
      alert("End time must be later than the reservation's start time.");
      return;
    }

    // 2️⃣ Within operating hours
    if (endTime < minTime || endTime > maxTime) {
      alert("Please select an end time between 10:00 AM and 10:00 PM.");
      return;
    }

    // 3️⃣ Check for conflicts
    if (isTimeReserved(seatId ?? null, endTime, startTime, id)) {
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

  const filteredWalkIns = walkIns.filter((w) => {
    const start = new Date(w.startTime);
    const end = new Date(w.endTime);

    if (selectedTime) {
      // Treat selection as a 1-hour window like seat logic
      const selected = new Date(selectedTime);
      const selectedEnd = new Date(selected);
      selectedEnd.setHours(selected.getHours() + 1);

      // Check if time overlaps
      const overlaps = start < selectedEnd && end > selected;
      return overlaps;
    }

    // Default: show only today's ongoing or future walk-ins
    const orderDay = new Date(start);
    orderDay.setHours(0, 0, 0, 0);

    return (
      orderDay.getTime() === today.getTime() && new Date(w.endTime) > new Date()
    );
  });

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
          const startTime = new Date(w.startTime);

          return (
            <div
              key={w.id}
              className="bg-white rounded-xl p-5 flex flex-col justify-between shadow-sm"
            >
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {w.seat?.name ?? "N/A"}
                </h2>
                {new Date() > new Date(w.endTime) && (
                  <p className="text-sm text-white p-2 font-bold mb-2 text-center rounded-sm bg-green-500">
                    Done
                  </p>
                )}
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
                <input
                  type="time"
                  id={`endTime-${w.id}`}
                  step={300} // ⏱ 5-minute steps
                  value={
                    selectedTimes[w.id]
                      ? new Date(selectedTimes[w.id]).toLocaleTimeString([], {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""
                  }
                  min="10:00"
                  max="22:00"
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value
                      .split(":")
                      .map(Number);
                    const startTime = new Date(w.startTime);

                    // Build end time using same date as start time
                    const timeDate = new Date(
                      startTime.getFullYear(),
                      startTime.getMonth(),
                      startTime.getDate(),
                      hours,
                      minutes
                    );
                    const isoTime = timeDate.toISOString();

                    // ✅ Just update selected time, no validation
                    handleTimeChange(w.id, isoTime);
                  }}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-800"
                />
              </div>

              <button
                className="w-full button-style"
                onClick={() => handleUpdate(w.id, w.seat?.id)}
              >
                Update
              </button>
              {(() => {
                const now = new Date();
                const start = new Date(w.startTime);
                const end = new Date(w.endTime);

                if (now >= start && now <= end) {
                  return (
                    <button
                      className="w-full mt-2 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
                      onClick={async () => {
                        const currentTimeIso = new Date().toISOString();
                        try {
                          const res = await fetch(`/api/walkins/${w.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ endTime: currentTimeIso }),
                          });

                          if (!res.ok)
                            throw new Error("Failed to update walk-in");

                          const updatedWalkIn = await res.json();

                          setWalkIns((prev) =>
                            prev.map((wi) =>
                              wi.id === w.id
                                ? { ...wi, endTime: updatedWalkIn.endTime }
                                : wi
                            )
                          );

                          alert(
                            `Walk-in marked as done at ${new Date(
                              updatedWalkIn.endTime
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          );
                        } catch (err) {
                          console.error(err);
                          alert("Failed to mark walk-in as done");
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
