"use client";

import AddUser from "./addusermain-components/AddUser";
import AddUserHeader from "./addusermain-components/UserHeader";
import { useState } from "react";

interface UserMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function UserMain({ toggleNav }: UserMainProps) {
  const [searchInput, setSearchInput] = useState("");

  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <AddUserHeader
        toggleNav={toggleNav}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      />
      <AddUser searchInput={searchInput} />
    </main>
  );
}

export default UserMain;
