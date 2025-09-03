"use client";

import DashboardHeader from "./main-components/DashboardHeader";
import DashboardContent from "./main-components/DashboardContent";

interface DashboardMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function DashboardMain({ toggleNav }: DashboardMainProps) {
  return (
    <main className="w-full h-screen overflow-auto text-brown">
      <DashboardHeader
        toggleNav={toggleNav} // pass toggle
      />
      <DashboardContent />
    </main>
  );
}
export default DashboardMain;
