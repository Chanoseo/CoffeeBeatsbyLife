"use client";

import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import UpdateSeats from "./UpdateSeats";

interface Seat {
  id: string;
  name: string;
  status: string;
}

function SeatsList() {
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch seats from API
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

  if (loading) return <p>Loading seats...</p>;

  return (
    <div className="w-full">
      {seats.length === 0 ? (
        <p>No seats available.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {seats.map((seat) => (
            <div
              key={seat.id}
              onClick={() => handleSeatClick(seat)}
              className="flex flex-col items-center p-4 rounded-xl border cursor-pointer hover:bg-gray-100 transition"
            >
              <FontAwesomeIcon
                icon={faUser}
                size="2x"
                className={seat.status === "Reserved" ? "text-red-500" : "text-green-500"}
              />
              <p className="mt-2 text-sm text-center">{seat.name}</p>
              <p className="text-xs text-gray-500">{seat.status}</p>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Show modal only when clicked */}
      {isUpdateOpen && selectedSeat && (
        <UpdateSeats
          seatId={selectedSeat.id}
          initialData={{
            name: selectedSeat.name,
            status: selectedSeat.status,
          }}
          onClose={() => setIsUpdateOpen(false)}
        />
      )}
    </div>
  );
}

export default SeatsList;
