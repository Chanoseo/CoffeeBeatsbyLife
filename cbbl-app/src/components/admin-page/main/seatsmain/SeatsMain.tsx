"use client";

import SeatsHeader from "./seatsmain-components/SeatsHeader";
import Seats from "./seatsmain-components/Seats";

interface ProductsMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function SeatsMain({ toggleNav }: ProductsMainProps) {

  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <SeatsHeader
        toggleNav={toggleNav} // pass toggle
      />
      <Seats />
    </main>
  );
}

export default SeatsMain;
