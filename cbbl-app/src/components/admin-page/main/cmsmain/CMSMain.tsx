"use client";

import CMS from "./cmsmain-components/CMS";
import CMSHeader from "./cmsmain-components/CMSHeader";

interface CMSMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function CMSMain({ toggleNav }: CMSMainProps) {
  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <CMSHeader toggleNav={toggleNav} />
      <CMS />
    </main>
  );
}

export default CMSMain;
