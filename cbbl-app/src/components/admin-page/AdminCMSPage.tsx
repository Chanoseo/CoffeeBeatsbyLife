"use client";

import Navigation from "@/components/admin-page/navigation/Navigation";
import { useEffect, useState } from "react";
import CMSMain from "./main/cmsmain/CMSMain";

function AdminSeatsPage() {
  const [collapsed, setCollapsed] = useState(false); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile sidebar

  // Detect screen size
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640); // sm breakpoint
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <div className="flex">
      <Navigation
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        toggleMobile={() => setMobileOpen(false)}
      />
      <CMSMain collapsed={collapsed} toggleNav={toggleSidebar} />
    </div>
  );
}
export default AdminSeatsPage;
