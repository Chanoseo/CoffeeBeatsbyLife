"use client";

import { useEffect, useState } from "react";
import { faExpand, faUser, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import SignOutButton from "@/components/walkin-page/SignOutButton";

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
  walkIns: WalkIn[]; // ✅ added
}

function WalkInsPage() {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guestCount, setGuestCount] = useState<number>(1);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Modal + Preview states
  const [isModalOpen, setIsModalOpen] = useState(false);
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

    fetchSeats();
  }, []);

  // ✅ Always use the current time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSelectedTime(now.toISOString());
    };

    updateTime(); // set immediately
    const timer = setInterval(updateTime, 60 * 1000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // ✅ Close modal when guest count mismatch
  useEffect(() => {
    if (selectedSeat) {
      const seat = seats.find((s) => s.id === selectedSeat);
      if (seat) {
        const capacityMismatch = guestCount !== seat.capacity;
        if (capacityMismatch) {
          setSelectedSeat(null);
          setIsModalOpen(false);
        }
      }
    }
  }, [guestCount, seats, selectedSeat]);

  if (loading) return <p className="text-center">Loading seats...</p>;

  return (
    <div className="container flex flex-col min-h-screen mx-auto py-10">
      <div className="flex-grow">
        <h1 className="text-3xl font-bold text-center mb-8">
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

        <div className="flex items-center mb-6">
          {/* Guest Selection */}
          <label
            htmlFor="guest"
            className="text-lg font-semibold text-gray-700 mr-2"
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

          {/* ✅ Show current time */}
          <span className="ml-6 text-gray-700 font-medium">
            Current Time:{" "}
            {selectedTime
              ? new Date(selectedTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </span>
        </div>

        {/* Seat Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {seats.length > 0 ? (
            seats.map((seat) => {
              const isSelected = selectedSeat === seat.id;

              let isReservedNow = false;
              let isWalkInNow = false;

              if (selectedTime) {
                const now = new Date(selectedTime);

                // ✅ Check reserved orders
                isReservedNow = seat.orders.some((order) => {
                  if (!order.startTime || !order.endTime) return false;
                  const orderStart = new Date(order.startTime);
                  const orderEnd = new Date(order.endTime);
                  return orderStart <= now && now <= orderEnd;
                });

                // ✅ Check walk-ins
                isWalkInNow = seat.walkIns?.some((w) => {
                  if (!w.startTime || !w.endTime) return false;
                  const walkInStart = new Date(w.startTime);
                  const walkInEnd = new Date(w.endTime);
                  return walkInStart <= now && now <= walkInEnd;
                });
              }

              // ✅ Check 2-hour conflict
              let hasConflict = false;
              if (selectedTime) {
                const selectedStart = new Date(selectedTime);
                const selectedEnd = new Date(
                  selectedStart.getTime() + 2 * 60 * 60 * 1000
                );

                hasConflict = seat.orders.some((order) => {
                  if (!order.startTime || !order.endTime) return false;
                  const orderStart = new Date(order.startTime);
                  const orderEnd = new Date(order.endTime);
                  return selectedStart < orderEnd && orderStart < selectedEnd;
                });
              }

              const capacityMismatch = guestCount !== seat.capacity;
              const isDisabled =
                hasConflict || capacityMismatch || isReservedNow || isWalkInNow;

              return (
                <div
                  key={seat.id}
                  className={`flex flex-col items-center p-4 rounded-xl border
                    ${
                      isWalkInNow
                        ? "bg-blue-100 text-blue-600 cursor-not-allowed"
                        : isReservedNow || hasConflict
                        ? "bg-red-100 text-red-600 cursor-not-allowed"
                        : capacityMismatch
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                        : ""
                    }
                    ${
                      isSelected &&
                      !(isReservedNow || hasConflict || isWalkInNow)
                        ? "bg-green-500 text-white"
                        : ""
                    }
                    ${
                      !isDisabled &&
                      !isSelected &&
                      !(isReservedNow || hasConflict || isWalkInNow)
                        ? "bg-white text-gray-800 hover:bg-green-50 cursor-pointer"
                        : ""
                    }
                `}
                  onClick={() => {
                    if (
                      !isDisabled &&
                      !(isReservedNow || hasConflict || isWalkInNow)
                    ) {
                      setSelectedSeat(seat.id);
                      setIsModalOpen(true);
                      setPreviewSeat(seat);
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faUser} size="2x" />
                  <p className="mt-2 text-sm text-center">{seat.name}</p>
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

        {/* ✅ Modal stays same */}
        {isModalOpen && (
          <div className="fixed left-0 top-0 w-full h-full z-50 flex justify-end bg-black/10">
            <div className="w-full md:w-1/3 bg-white p-6 shadow-lg overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Add Walk-In</h2>
                <FontAwesomeIcon
                  icon={faX}
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedSeat(null);
                  }}
                  className="text-xl cursor-pointer"
                />
              </div>

              {/* ✅ Seat Preview */}
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
                        setExpandedImage(
                          previewSeat.imageUrl || "/cbbl-image.jpg"
                        )
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

              {/* ✅ Reservation details unchanged */}
              {selectedTime && (
                <div className="mb-6 space-y-4">
                  {(() => {
                    const now = new Date(selectedTime);
                    const start = new Date(now);
                    start.setMinutes(0, 0, 0);
                    const end = new Date(start);
                    end.setHours(start.getHours() + 2);

                    return (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Time
                          </label>
                          <input
                            type="text"
                            value={start.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            disabled
                            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Time
                          </label>
                          <input
                            type="text"
                            value={end.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            disabled
                            className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <button
                className="button-style w-full"
                onClick={async () => {
                  if (!selectedSeat || !selectedTime) return;

                  const now = new Date(selectedTime);
                  const start = new Date(now);
                  start.setMinutes(0, 0, 0);
                  const end = new Date(start);
                  end.setHours(start.getHours() + 2);

                  const res = await fetch("/api/walkins", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      seatId: selectedSeat,
                      guest: guestCount,
                      startTime: start.toISOString(),
                      endTime: end.toISOString(),
                    }),
                  });

                  const data = await res.json();
                  if (data.success) {
                    alert("Walk-in added successfully!");
                    setIsModalOpen(false);

                    const refresh = await fetch("/api/seats");
                    const refreshData = await refresh.json();
                    if (refreshData.success) setSeats(refreshData.seats);
                  } else {
                    alert("Failed to add walk-in");
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <SignOutButton />
      </div>
    </div>
  );
}

export default WalkInsPage;
