"use client";

import { faColumns } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface CMSHeaderProps {
  toggleNav: () => void; // add toggleNav
}

function CMSHeader({ toggleNav }: CMSHeaderProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="flex flex-col gap-4 p-6 lg:flex-row justify-between">
      <div className="flex justify-between items-center gap-2 w-full">
        <div className="flex items-center gap-2 lg:gap-4 text-xl md:text-2xl">
          <FontAwesomeIcon
            icon={faColumns}
            className="cursor-pointer"
            onClick={toggleNav}
          />
          <h2 className="font-semibold">CMS</h2>
        </div>
        <p className="text-xs text-nowrap md:text-sm">{formattedDate}</p>
      </div>
    </section>
  );
}

export default CMSHeader;
