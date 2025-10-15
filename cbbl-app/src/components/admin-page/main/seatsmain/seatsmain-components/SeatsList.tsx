"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import UpdateSeats from "./UpdateSeats";

interface WalkIn {
  id: string;
  startTime: string;
  endTime: string;
}

interface SeatOrderSeatEntry {
  // supports both shapes: OrderSeat with its own start/end OR legacy nested order
  startTime?: string;
  endTime?: string;
  status?: string;
  order?: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
  };
}

interface Seat {
  id: string;
  name: string;
  status: string;
  capacity: number;
  imageUrl?: string;
  description?: string;
  orderSeats?: SeatOrderSeatEntry[];
  walkIns?: WalkIn[];
}

interface Props {
  selectedTime: string | null;
  refreshSignal?: number;
}

function SeatsList({ selectedTime, refreshSignal }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = async () => {
    try {
      const res = await fetch("/api/seats");
      const data = await res.json();
      if (data.success) {
        setSeats(data.seats);
      }
    } catch (err) {
      console.error("Error fetching seats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshSignal !== undefined) fetchSeats();
  }, [refreshSignal]);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsUpdateOpen(true);
  };

  const parseDate = (s?: string) => (s ? new Date(s) : null);

  const getSeatStatus = (seat: Seat) => {
    // ✅ If no selected time, treat all seats as available
    if (!selectedTime) return "available";

    const selected = new Date(selectedTime);
    const selectedEnd = new Date(selected);
    selectedEnd.setHours(selected.getHours() + 1);

    // Build list of reservation intervals using OrderSeat times first,
    // fallback to nested order times for backward compatibility.
    const orders = (seat.orderSeats ?? [])
      .map((os) => {
        const start = parseDate(os.startTime ?? os.order?.startTime);
        const end = parseDate(os.endTime ?? os.order?.endTime);
        const status = os.status ?? os.order?.status ?? "Reserved";
        return { start, end, status };
      })
      .filter((o) => o.start && o.end) as {
      start: Date;
      end: Date;
      status: string;
    }[];
    const walkIns = seat.walkIns ?? [];

    // Helper: check overlap between [selected, selectedEnd] and [start, end]
    const overlaps = (start: Date, end: Date) =>
      start < selectedEnd && end > selected;

    // 1️⃣ Completed order overlap → OCCUPIED
    const hasCompletedOverlap = orders.some((order) => {
      if (order.status !== "Completed") return false;
      return overlaps(order.start, order.end);
    });
    if (hasCompletedOverlap) return "occupied";

    // 2️⃣ Active (non-completed) order overlap → RESERVED
    const hasActiveOverlap = orders.some((order) => {
      if (order.status === "Completed" || order.status === "Canceled")
        return false;
      return overlaps(order.start, order.end);
    });
    if (hasActiveOverlap) return "order";

    // 3️⃣ Walk-in overlap → OCCUPIED
    const hasWalkInOverlap = walkIns.some((w) => {
      const start = new Date(w.startTime);
      const end = new Date(w.endTime);
      return overlaps(start, end);
    });
    if (hasWalkInOverlap) return "walkin";

    return "available";
  };

  if (loading) return <p>Loading seats...</p>;

  return (
    <div className="w-full">
      {seats.length === 0 ? (
        <p>No seats available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {seats.map((seat) => {
            const status = getSeatStatus(seat);
            let displayStatus = "Available";
            let seatColorClass = "text-green-500";

            if (status === "order") {
              displayStatus = "Reserved";
              seatColorClass = "text-red-500";
            } else if (status === "walkin" || status === "occupied") {
              displayStatus = "Occupied";
              seatColorClass = "text-blue-500";
            }

            return (
              <div
                key={seat.id}
                onClick={() => handleSeatClick(seat)}
                className="flex flex-col items-center p-4 rounded-xl shadow-sm cursor-pointer bg-white hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon
                  icon={faUser}
                  size="2x"
                  className={seatColorClass}
                />
                <p className="mt-2 text-sm text-center">{seat.name}</p>
                <p className="text-xs text-gray-500">{displayStatus}</p>
                <p className="text-xs text-gray-400">
                  Capacity: {seat.capacity}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {isUpdateOpen && selectedSeat && (
        <UpdateSeats
          seatId={selectedSeat.id}
          initialData={{
            name: selectedSeat.name,
            status:
              getSeatStatus(selectedSeat) === "order"
                ? "Reserved"
                : getSeatStatus(selectedSeat) === "walkin" ||
                  getSeatStatus(selectedSeat) === "occupied"
                ? "Occupied"
                : "Available",
            capacity: selectedSeat.capacity,
            imageUrl: selectedSeat.imageUrl ?? "",
            description: selectedSeat.description ?? "",
          }}
          onClose={() => setIsUpdateOpen(false)}
          onRefresh={() => fetchSeats()}
        />
      )}
    </div>
  );
}

export default SeatsList;
