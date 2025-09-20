"use client";

import { useState } from "react";
import SeatsHeader from "./seatsmain-components/SeatsHeader";
import Seats from "./seatsmain-components/Seats";
import ReservationInfo from "./seatsmain-components/ReservationInfo";
import WalkIn from "./seatsmain-components/WalkIn";

interface ProductsMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function SeatsMain({ toggleNav }: ProductsMainProps) {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <SeatsHeader toggleNav={toggleNav} />
      <Seats selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
      <ReservationInfo selectedTime={selectedTime} />
      <WalkIn selectedTime={selectedTime} />
    </main>
  );
}

export default SeatsMain;
