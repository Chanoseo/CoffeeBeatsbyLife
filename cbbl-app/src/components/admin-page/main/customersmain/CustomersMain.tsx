// CustomersMain.tsx
import { useState } from "react";
import Customers from "./customersmain-components/Customers";
import CustomersHeader from "./customersmain-components/CustomersHeader";

interface CustomersMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function CustomersMain({ toggleNav }: CustomersMainProps) {
  const [searchInput, setSearchInput] = useState(""); // ✅ Add search state

  return (
    <main className="w-full h-screen overflow-auto text-brown">
      <CustomersHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        toggleNav={toggleNav}
      />
      <Customers searchInput={searchInput} /> {/* ✅ Pass to Customers */}
    </main>
  );
}
export default CustomersMain;
