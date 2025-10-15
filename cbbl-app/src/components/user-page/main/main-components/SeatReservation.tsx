"use client";

import { useEffect, useState } from "react";
import { faExpand, faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";

interface OrderSeat {
  id: string;
  startTime: string;
  endTime: string;
  order: { status: string };
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
  imageUrl?: string;
  description?: string;
  orderSeats: OrderSeat[];
  walkIns: WalkIn[];
}

interface Props {
  selectedSeats: string[];
  setSelectedSeats: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  guestCount: number;
  setGuestCount: (count: number) => void;
}

function SeatReservation({
  selectedSeats,
  setSelectedSeats,
  selectedTime,
  setSelectedTime,
  guestCount,
  setGuestCount,
}: Props) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewSeat, setPreviewSeat] = useState<Seat | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  //Fetch seats
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

    fetchSeats(); //initial fetch

    //Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchSeats, 5000);

    return () => clearInterval(interval); //cleanup
  }, []);

  // Reset selection if time changes
  useEffect(() => {
    setSelectedSeats([]);
    setPreviewSeat(null);
  }, [selectedTime, setSelectedSeats]);

  // Reset selection if guest count changes
  useEffect(() => {
    setSelectedSeats([]);
    setPreviewSeat(null);
  }, [guestCount, setSelectedSeats]);

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
              setGuestCount(value === "" ? 0 : Number(value));
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
          <span className="text-gray-600 text-sm">Reserved / Unavailable</span>
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
            const isSelected = selectedSeats.includes(seat.id);

            let hasOrderConflict = false;
            let hasWalkInConflict = false;
            let isUnavailable = false;

            const isOccupied = selectedTime
              ? seat.orderSeats.some((os) => {
                  const start = new Date(os.startTime);
                  const end = new Date(os.endTime);
                  const selected = new Date(selectedTime);
                  const status = os.order?.status?.toLowerCase?.() || "";
                  return (
                    status === "completed" &&
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
              hasOrderConflict = seat.orderSeats.some((os) => {
                const status = os.order?.status?.toLowerCase?.() || "";
                if (status === "canceled") return false;
                const seatStart = new Date(os.startTime);
                const seatEnd = new Date(os.endTime);
                return selectedStart >= seatStart && selectedStart < seatEnd;
              });

              // BLUE: selectedStart inside walk-in
              hasWalkInConflict = seat.walkIns?.some((walkIn) => {
                const walkInStart = new Date(walkIn.startTime);
                const walkInEnd = new Date(walkIn.endTime);
                return (
                  selectedStart >= walkInStart && selectedStart < walkInEnd
                );
              });

              // RED: partially overlaps any reservation/walk-in
              if (!hasOrderConflict && !hasWalkInConflict) {
                const allBookings = [
                  ...seat.orderSeats.map((os) => ({
                    startTime: os.startTime,
                  })),
                  ...(seat.walkIns ?? []),
                ];
                isUnavailable = allBookings.some((booking) => {
                  const start = new Date(booking.startTime);
                  return selectedStart < start && selectedEnd > start;
                });
              }
            }

            // Seat is considered "would exceed" when selecting it
            const currentSelectedCapacity = selectedSeats.reduce(
              (sum, seatId) => {
                const s = seats.find((s) => s.id === seatId);
                return s ? sum + s.capacity : sum;
              },
              0
            );

            const wouldExceedGuest =
              guestCount > 0 && currentSelectedCapacity >= guestCount;

            // Disabled logic
            const isDisabled =
              hasOrderConflict ||
              hasWalkInConflict ||
              isUnavailable ||
              isOccupied ||
              wouldExceedGuest;

            // Seat color
            let seatColorClass = "";
            if (isSelected) {
              seatColorClass = "bg-green-500 text-white"; // Selected seat
            } else if (isOccupied || hasWalkInConflict) {
              seatColorClass = "bg-blue-100 text-blue-600 cursor-not-allowed"; // Occupied / walk-in
            } else if (hasOrderConflict || isUnavailable) {
              seatColorClass = "bg-red-100 text-red-600 cursor-not-allowed"; // Reserved / conflict
            } else if (wouldExceedGuest) {
              seatColorClass = "bg-gray-200 text-gray-400 cursor-not-allowed"; // Would exceed guest count
            } else {
              seatColorClass =
                "bg-white text-gray-800 hover:bg-green-50 cursor-pointer"; // Available
            }

            return (
              <div
                key={seat.id}
                className={`flex flex-col items-center p-4 rounded-xl border ${seatColorClass}`}
                onClick={() => {
                  if (!isSelected && isDisabled) return;

                  const currentSeat = seats.find((s) => s.id === seat.id);
                  if (!currentSeat) return;

                  // Toggle seat selection
                  if (isSelected) {
                    setSelectedSeats(
                      selectedSeats.filter((s) => s !== seat.id)
                    );
                    if (previewSeat?.id === seat.id) setPreviewSeat(null);
                  } else {
                    setSelectedSeats([...selectedSeats, seat.id]);
                    setPreviewSeat(currentSeat);
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
