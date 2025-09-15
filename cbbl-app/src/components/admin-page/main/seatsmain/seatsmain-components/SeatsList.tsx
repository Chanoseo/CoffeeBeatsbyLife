"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import UpdateSeats from "./UpdateSeats";

interface Order {
  id: string;
  startTime: string;
  endTime: string;
}

interface Seat {
  id: string;
  name: string;
  status: string; // still in schema, but we won’t rely on it for display
  capacity: number;
  orders?: Order[];
}

interface Props {
  selectedTime: string | null;
}

function SeatsList({ selectedTime }: Props) {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const res = await fetch("/api/seats");
        const data = await res.json();

        if (data.success) {
          setSeats(data.seats);
        } else {
          console.error("Failed to fetch seats");
        }
      } catch (err) {
        console.error("Error fetching seats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeats();
  }, []);

  const handleSeatClick = (seat: Seat) => {
    setSelectedSeat(seat);
    setIsUpdateOpen(true);
  };

  // ✅ Check if seat is reserved at selectedTime
  const isSeatReserved = (seat: Seat) => {
    if (!selectedTime || !seat.orders) return false;

    const selected = new Date(selectedTime);

    return seat.orders.some((order) => {
      const orderStart = new Date(order.startTime);
      const orderEnd = new Date(order.endTime);

      return selected >= orderStart && selected < orderEnd;
    });
  };

  if (loading) return <p>Loading seats...</p>;

  return (
    <div className="w-full">
      {seats.length === 0 ? (
        <p>No seats available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {seats.map((seat) => {
            const reserved = isSeatReserved(seat);

            // ✅ Compute display status
            const displayStatus = reserved ? "Reserved" : "Available";

            // ✅ Seat colors based on status
            const seatColorClass =
              displayStatus === "Reserved" ? "text-red-500" : "text-green-500";

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
            status: isSeatReserved(selectedSeat) ? "Reserved" : "Available",
            capacity: selectedSeat.capacity,
          }}
          onClose={() => setIsUpdateOpen(false)}
        />
      )}
    </div>
  );
}

export default SeatsList;
