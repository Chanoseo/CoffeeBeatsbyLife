"use client";

import { useEffect, useState } from "react";
import {
  faAngleDown,
  faExpand,
  faUser,
  faX,
} from "@fortawesome/free-solid-svg-icons";
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
  imageUrl?: string;
  description?: string;
  orders: Order[];
  walkIns: WalkIn[];
}

function Seat() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewSeat, setPreviewSeat] = useState<Seat | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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

    const interval = setInterval(fetchSeats, 5000); // ✅ refresh every 5s

    return () => clearInterval(interval); // ✅ cleanup on unmount
  }, []);

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
    <div className="px-40 py-25 text-brown">
      <div className="flex flex-col">
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

        {/* Time Selection Only */}
        <div className="w-full max-w-sm mb-6">
          <label
            htmlFor="time"
            className="text-lg font-semibold text-gray-700 mb-2 block"
          >
            Select Time:
          </label>
          <div className="relative">
            <select
              id="time"
              value={selectedTime ?? ""}
              onChange={(e) => setSelectedTime(e.target.value || null)}
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
            <FontAwesomeIcon
              icon={faAngleDown}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {previewSeat && (
          <div className="w-full border border-gray-200 rounded-xl bg-white p-4 flex flex-col gap-3 items-center mb-4">
            <h1 className="text-lg font-semibold text-gray-800">
              {previewSeat.name}
            </h1>

            {/* Image */}
            <div className="relative w-full h-56">
              <Image
                src={previewSeat.imageUrl || "/cbbl-image.jpg"}
                alt={previewSeat.name || "seat"}
                width={400}
                height={400}
                className="w-full h-full object-cover rounded-xl"
              />
              <button
                className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/50 text-gray-700 rounded-full hover:bg-white hover:text-[#3C604C] transition-colors"
                onClick={() =>
                  setExpandedImage(previewSeat.imageUrl || "/cbbl-image.jpg")
                }
              >
                <FontAwesomeIcon icon={faExpand} className="text-sm" />
              </button>
            </div>

            {/* Expanded Image */}
            {expandedImage && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <button
                  className="fixed top-4 right-4 w-10 h-10 flex items-center justify-center 
                             bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-600 
                             transition-colors shadow-md"
                  onClick={() => setExpandedImage(null)}
                >
                  <FontAwesomeIcon icon={faX} className="text-lg" />
                </button>
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

            <div className="flex flex-col gap-1 w-full text-center">
              <p className="text-gray-600 text-sm">
                {previewSeat.description ||
                  "Comfortable seating with premium view"}
              </p>
              <span className="inline-block bg-[#3C604C]/10 text-[#3C604C] px-3 py-1 rounded-full text-sm font-medium">
                Capacity: {previewSeat.capacity} People
              </span>
            </div>
          </div>
        )}

        {/* Seat Grid (View Only) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {seats.length > 0 ? (
            seats.map((seat) => {
              let seatColorClass = "bg-white text-gray-800 border-gray-200"; // default

              if (selectedTime) {
                const selectedStart = new Date(selectedTime);

                const hasOrderConflict = seat.orders.some((order) => {
                  const orderStart = new Date(order.startTime);
                  const orderEnd = new Date(order.endTime);
                  return (
                    selectedStart >= orderStart && selectedStart < orderEnd
                  );
                });

                const hasWalkInConflict = seat.walkIns?.some((walkIn) => {
                  const walkInStart = new Date(walkIn.startTime);
                  const walkInEnd = new Date(walkIn.endTime);
                  return (
                    selectedStart >= walkInStart && selectedStart < walkInEnd
                  );
                });

                if (hasOrderConflict) {
                  seatColorClass = "bg-red-100 text-red-600 border-red-400";
                } else if (hasWalkInConflict) {
                  seatColorClass = "bg-blue-100 text-blue-600 border-blue-400";
                }
              }

              // ✅ Highlight if selected (green)
              const isSelected = previewSeat?.id === seat.id;
              if (isSelected) {
                seatColorClass = "bg-green-500 text-white border-green-600";
              }

              return (
                <div
                  key={seat.id}
                  className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all ${seatColorClass}`}
                  onClick={() => setPreviewSeat(seat)}
                >
                  <FontAwesomeIcon icon={faUser} size="2x" />
                  <p className="mt-2 text-sm text-center font-medium">
                    {seat.name}
                  </p>
                  <p className="text-xs text-center">
                    Capacity: {seat.capacity}
                  </p>
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
    </div>
  );
}

export default Seat;
