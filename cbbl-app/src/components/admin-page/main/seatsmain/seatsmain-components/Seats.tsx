"use client";

import { faPlus, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import SeatsList from "./SeatsList";
import AddSeat from "./AddSeat";

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

function Seats({
  selectedTime,
  setSelectedTime,
}: {
  selectedTime: string | null;
  setSelectedTime: (t: string | null) => void;
}) {
  const [showAddSeats, setShowAddSeats] = useState(false);

  const handleToggle = () => {
    setShowAddSeats((prev) => !prev);
  };

  const now = new Date();

  return (
    <section className="products-card">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg lg:text-xl xl:text-2xl">Manage Seats</h1>

        <div className="flex items-center justify-center gap-4">
          {/* Time Selection Dropdown */}
          <div className="flex flex-col">
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
                className="border border-gray-300 rounded-lg px-4 py-2 outline-none bg-white text-gray-800 appearance-none w-48"
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

                  return (
                    <option key={time} value={isoTime}>
                      {time}
                    </option>
                  );
                })}
              </select>

              {/* Custom Arrow Icon */}
              <FontAwesomeIcon
                icon={faAngleDown}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400"
              />
            </div>
          </div>

          {/* Add Seat Button */}
          <button
            onClick={handleToggle}
            className="bg-[#3C604C] text-sm text-white px-4 py-2 rounded cursor-pointer hover:bg-[#2F4A3A] transition-colors duration-200 ease-linear w-fit text-nowrap lg:text-base flex items-center"
          >
            <span>Add Seat</span>
            <FontAwesomeIcon icon={faPlus} className="ml-2" />
          </button>
        </div>
      </div>

      {showAddSeats && <AddSeat onClose={handleToggle} />}
      <SeatsList selectedTime={selectedTime} />
    </section>
  );
}

export default Seats;
