"use client";

import AddUser from "./addusermain-components/AddUser";
import AddUserHeader from "./addusermain-components/UserHeader";

interface UserMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function UserMain({ toggleNav }: UserMainProps) {
  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <AddUserHeader toggleNav={toggleNav} />
      <AddUser />
    </main>
  );
}

export default UserMain;
