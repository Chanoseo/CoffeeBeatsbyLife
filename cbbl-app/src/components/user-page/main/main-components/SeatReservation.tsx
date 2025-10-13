"use client";

import { useEffect, useState } from "react";
import { faExpand, faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

interface Order {
  id: string;
  status: string;
  startTime: string;
  endTime: string;
}

interface WalkIn {
  id: string;
  startTime: string;
  endTime: string;
  guest: number;
}

interface Seat {
  id: string;
  name: string;
  status: string;
  capacity: number;
  imageUrl?: string; // ✅ Add this
  description?: string; // ✅ Add this
  orders: Order[];
  walkIns: WalkIn[]; // ✅ add this
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
  const [previewSeat, setPreviewSeat] = useState<Seat | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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

    fetchSeats(); // ✅ initial fetch

    // ✅ Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchSeats, 5000);

    return () => clearInterval(interval); // ✅ cleanup
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
    setPreviewSeat(null);
  }, [selectedTime, setSelectedSeat]);

  if (loading) return <p className="text-center">Loading seats...</p>;

  return (
    <div className="mt-6 w-full p-6 bg-gray-50 rounded-xl">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Select Your Preferable Seat
      </h1>

      {/* Time & Guest Section */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Time Selection */}
        <div className="flex flex-col">
          <label
            htmlFor="time"
            className="text-lg font-semibold text-gray-700 mb-2"
          >
            Select Time:
          </label>

          <input
            type="time"
            id="time"
            step="900" // 900 seconds = 15 minutes
            value={
              selectedTime
                ? new Date(selectedTime).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""
            }
            min="10:00"
            max="22:00"
            onChange={(e) => {
              const [hourStr, minuteStr] = e.target.value.split(":");
              const hours = Number(hourStr);
              const minutes = Number(minuteStr);

              const now = new Date();
              const selectedDate = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                hours,
                minutes
              );

              setSelectedTime(selectedDate.toString());
            }}
            className="border border-gray-300 rounded-lg p-3 outline-none bg-white text-gray-800"
          />
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
            value={guestCount || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setGuestCount(0); // ✅ keep it empty visually
              } else {
                setGuestCount(Number(value));
              }
            }}
            className="border border-gray-300 rounded-lg p-3 outline-none bg-white text-gray-800"
          />
        </div>
      </div>

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

      {previewSeat && (
        <div className="w-full border border-gray-200 rounded-xl bg-white p-4 flex flex-col gap-3 items-center mb-4">
          {/* Header */}
          <h1 className="text-lg font-semibold text-gray-800">
            {previewSeat.name}
          </h1>

          {/* Image Container */}
          <div className="relative w-full h-56">
            <Image
              src={previewSeat.imageUrl || "/cbbl-image.jpg"}
              alt={previewSeat.name || "seat"}
              width={400}
              height={400}
              className="w-full h-full object-cover rounded-xl"
            />

            {/* Resize Icon */}
            <button className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/50 text-gray-700 rounded-full hover:bg-white hover:text-[#3C604C] transition-colors">
              <FontAwesomeIcon
                icon={faExpand}
                className="text-sm"
                onClick={() =>
                  setExpandedImage(previewSeat.imageUrl || "/cbbl-image.jpg")
                }
              />
            </button>
          </div>

          {/* Expanded Image Section */}
          {expandedImage && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
              {/* Close button */}
              <button
                className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center 
                           bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-600 
                           transition-colors shadow-md"
                type="button"
                onClick={() => setExpandedImage(null)}
              >
                <FontAwesomeIcon icon={faX} className="text-lg" />
              </button>

              {/* Image container */}
              <div className="max-w-3xl max-h-[85vh] w-auto h-auto p-4 flex items-center justify-center">
                <Image
                  src={expandedImage}
                  alt="Expanded seat preview"
                  width={800}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain shadow-lg"
                />
              </div>
            </div>
          )}

          {/* Seat Info */}
          <div className="flex flex-col gap-1 w-full text-center">
            <p className="text-gray-600 text-sm">
              {previewSeat.description ||
                "Comfortable seating with premium view"}
            </p>
            <span className="inline-block bg-[#3C604C]/10 text-[#3C604C] px-3 py-1 rounded-full text-sm font-medium">
              Capacity: {previewSeat.capacity || 4} People
            </span>
          </div>
        </div>
      )}

      {/* Seat Selection (all seats, disable if guest count doesn't match) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {seats.length > 0 ? (
          seats.map((seat) => {
            const isSelected = selectedSeat === seat.id;

            let hasOrderConflict = false; // red → fully inside reserved time
            let hasWalkInConflict = false; // blue → fully inside walk-in
            let isUnavailable = false; // gray → partially overlaps future reservation/walk-in
            // const now = new Date();

            const isOccupied = selectedTime
              ? seat.orders.some((order) => {
                  const start = new Date(order.startTime);
                  const end = new Date(order.endTime);
                  const selected = new Date(selectedTime);
                  return (
                    order.status === "Completed" &&
                    selected >= start &&
                    selected < end
                  );
                })
              : false;

            if (selectedTime) {
              const selectedStart = new Date(selectedTime);
              // 2-hour default slot
              let selectedEnd = new Date(
                selectedStart.getTime() + 2 * 60 * 60 * 1000
              );

              // Cap end time at 10 PM
              const closingTime = new Date(selectedStart);
              closingTime.setHours(22, 0, 0, 0); // 10:00 PM
              if (selectedEnd > closingTime) {
                selectedEnd = closingTime;
              }

              // RED: selectedStart inside reservation
              hasOrderConflict = seat.orders.some((order) => {
                if (order.status === "Canceled") return false; 
                const orderStart = new Date(order.startTime);
                const orderEnd = new Date(order.endTime);
                return selectedStart >= orderStart && selectedStart < orderEnd;
              });

              // BLUE: selectedStart inside walk-in
              hasWalkInConflict = seat.walkIns?.some((walkIn) => {
                const walkInStart = new Date(walkIn.startTime);
                const walkInEnd = new Date(walkIn.endTime);
                return (
                  selectedStart >= walkInStart && selectedStart < walkInEnd
                );
              });

              // GRAY: partially overlaps any reservation/walk-in but not fully inside
              if (!hasOrderConflict && !hasWalkInConflict) {
                const allBookings = [...seat.orders, ...(seat.walkIns ?? [])];
                isUnavailable = allBookings.some((booking) => {
                  const start = new Date(booking.startTime);
                  // partial overlap: selectedStart before booking start but selectedEnd overlaps booking start
                  return selectedStart < start && selectedEnd > start;
                });
              }
            }

            // Disable seat if fully conflicted or partially conflicted
            const capacityMismatch = guestCount !== seat.capacity;
            const isDisabled =
              hasOrderConflict ||
              hasWalkInConflict ||
              capacityMismatch ||
              isUnavailable ||
              isOccupied;

            // Seat color
            let seatColorClass = "";
            if (isSelected) {
              seatColorClass = "bg-green-500 text-white";
            } else if (isOccupied) {
              seatColorClass = "bg-blue-100 text-blue-600 cursor-not-allowed"; // occupied (completed order)
            } else if (hasOrderConflict) {
              seatColorClass = "bg-red-100 text-red-600 cursor-not-allowed"; // fully reserved
            } else if (hasWalkInConflict) {
              seatColorClass = "bg-blue-100 text-blue-600 cursor-not-allowed"; // fully occupied
            } else if (capacityMismatch) {
              seatColorClass =
                "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"; // ❌ capacity mismatch
            } else if (isUnavailable) {
              seatColorClass =
                "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"; // partial conflict
            } else {
              seatColorClass =
                "bg-white text-gray-800 hover:bg-green-50 cursor-pointer";
            }

            return (
              <div
                key={seat.id}
                className={`flex flex-col items-center p-4 rounded-xl border ${seatColorClass}`}
                onClick={() => {
                  if (!isDisabled) {
                    setSelectedSeat(seat.id);
                    setPreviewSeat(seat); // ✅ update preview
                  }
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
    </div>
  );
}

export default SeatReservation;
