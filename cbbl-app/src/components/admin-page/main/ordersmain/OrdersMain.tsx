"use client";

import { useState } from "react";
import Orders from "./ordersmain-components/Orders";
import OrdersHeader from "./ordersmain-components/OrdersHeader";

interface OrdersMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function OrdersMain({ toggleNav }: OrdersMainProps) {
  const [searchInput, setSearchInput] = useState("");

  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <OrdersHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        toggleNav={toggleNav} // pass toggle
      />
      <Orders searchInput={searchInput} />
    </main>
  );
}
export default OrdersMain;
