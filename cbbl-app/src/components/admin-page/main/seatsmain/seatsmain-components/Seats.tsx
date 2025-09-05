"use client";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import SeatsList from "./SeatsList";
import AddSeat from "./AddSeat";

function Seats() {
  const [showAddSeats, setShowAddSeats] = useState(false);

  const handleToggle = () => {
    setShowAddSeats((prev) => !prev);
  };

  return (
    <section className="products-card">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg lg:text-xl xl:text-2xl">Manage Seats</h1>
        <div className="flex flex-col gap-4 items-end md:flex-row">
          {/* Add Seat Button */}
          <button
            onClick={handleToggle}
            className="bg-[#3C604C] text-sm text-white px-4 py-2 rounded cursor-pointer hover:bg-[#2F4A3A] transition-colors duration-200 ease-linear w-fit text-nowrap lg:text-base"
          >
            <span>Add Seat</span>
            <FontAwesomeIcon icon={faPlus} className="ml-2" />
          </button>
        </div>
      </div>

      {showAddSeats && <AddSeat onClose={handleToggle} />}
      <SeatsList />
    </section>
  );
}

export default Seats;
