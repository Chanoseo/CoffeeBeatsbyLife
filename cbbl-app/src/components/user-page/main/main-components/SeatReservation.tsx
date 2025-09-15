"use client";

import { useEffect, useState } from "react";
import { faAngleDown, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Order {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface Seat {
  id: string;
  name: string;
  status: string;
  capacity: number;
  orders: Order[];
}

interface Props {
  selectedSeat: string | null;
  setSelectedSeat: (seatId: string | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
}

function SeatReservation({
  selectedSeat,
  setSelectedSeat,
  selectedTime,
  setSelectedTime,
  guestCount,
  setGuestCount,
}: Props) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch seats
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

  // ✅ Unselect seat if guest count doesn’t match its capacity
  useEffect(() => {
    if (selectedSeat) {
      const seat = seats.find((s) => s.id === selectedSeat);
      if (seat) {
        const capacityMismatch = guestCount !== seat.capacity;
        if (capacityMismatch) {
          setSelectedSeat(null);
        }
      }
    }
  }, [guestCount, seats, selectedSeat, setSelectedSeat]);

  // Unselect seat only when time changes
  useEffect(() => {
    setSelectedSeat(null);
  }, [selectedTime, setSelectedSeat]);

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

  const now = new Date();

  if (loading) return <p className="text-center">Loading seats...</p>;

  return (
    <div className="mt-6 w-full p-6 bg-gray-50 rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Select Your Preferable Seat
      </h1>

      {/* Seat Status Legend */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-white border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-green-500 border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-red-500 border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Reserved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-blue-500 border border-gray-400"></span>
          <span className="text-gray-600 text-sm">Occupied</span>
        </div>
      </div>

      {/* Seat Selection (all seats, disable if guest count doesn't match) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {seats.length > 0 ? (
          seats.map((seat) => {
            const isSelected = selectedSeat === seat.id;

            // ✅ Check time conflicts
            let hasConflict = false;
            if (selectedTime) {
              const selectedStart = new Date(selectedTime);
              const selectedEnd = new Date(
                selectedStart.getTime() + 2 * 60 * 60 * 1000
              );

              hasConflict = seat.orders.some((order) => {
                const orderStart = new Date(order.startTime);
                const orderEnd = new Date(order.endTime);

                // Overlap check
                return selectedStart < orderEnd && orderStart < selectedEnd;
              });
            }

            // ✅ Only mismatch if guests exceed capacity
            const capacityMismatch = guestCount !== seat.capacity;
            const isDisabled = hasConflict || capacityMismatch;

            return (
              <div
                key={seat.id}
                className={`flex flex-col items-center p-4 rounded-xl border
                  ${
                    isDisabled
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                      : ""
                  }
                  ${hasConflict ? "bg-red-100 text-red-600" : ""}
                  ${isSelected ? "bg-green-500 text-white" : ""}
                  ${
                    !isDisabled && !isSelected
                      ? "bg-white text-gray-800 hover:bg-green-50 cursor-pointer"
                      : ""
                  }
                `}
                onClick={() => {
                  if (!isDisabled) setSelectedSeat(seat.id);
                }}
              >
                <FontAwesomeIcon icon={faUser} size="2x" />
                <p className="mt-2 text-sm text-center">{seat.name}</p>
                <p className="text-xs text-center">Capacity: {seat.capacity}</p>
              </div>
            );
          })
        ) : (
          <p className="text-center col-span-full text-gray-500">
            No seats available.
          </p>
        )}
      </div>

      {/* Time & Guest Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Time Selection */}
        <div className="flex flex-col">
          <label
            htmlFor="time"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Select Time:
          </label>
          <div className="relative">
            <select
              id="time"
              value={selectedTime ?? ""}
              onChange={(e) => {
                const isoStr = e.target.value;
                if (!isoStr) {
                  setSelectedTime(null);
                  return;
                }
                setSelectedTime(isoStr);
              }}
              className="border border-gray-300 rounded-lg p-3 pr-10 outline-none bg-white text-gray-800 appearance-none w-full"
            >
              <option value="">-- Select Time --</option>
              {timeOptions.map((time) => {
                const [timePart, modifier] = time.split(" ");
                const [hourStr, minuteStr] = timePart.split(":");
                let hours = Number(hourStr);
                const minutes = Number(minuteStr);

                if (modifier === "PM" && hours < 12) hours += 12;
                if (modifier === "AM" && hours === 12) hours = 0;

                const timeDate = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  hours,
                  minutes
                );

                const isoTime = timeDate.toISOString();
                const isPast = timeDate < now;

                return (
                  <option key={time} value={isoTime} disabled={isPast}>
                    {time} {isPast ? "(Past)" : ""}
                  </option>
                );
              })}
            </select>

            {/* Custom Arrow Icon */}
            <FontAwesomeIcon
              icon={faAngleDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Guest Selection */}
        <div className="flex flex-col">
          <label
            htmlFor="guest"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Guests:
          </label>
          <input
            type="number"
            name="guest"
            id="guest"
            min="1"
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            className="border border-gray-300 rounded-lg p-3 outline-none bg-white text-gray-800"
          />
        </div>
      </div>
    </div>
  );
}

export default SeatReservation;
