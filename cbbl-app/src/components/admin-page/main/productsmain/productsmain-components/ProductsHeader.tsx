"use client";

import {
  faColumns,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface ProductsHeaderProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  toggleNav: () => void; // add toggleNav
}

function ProductsHeader({
  searchInput,
  setSearchInput,
  toggleNav,
}: ProductsHeaderProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <section className="flex flex-col gap-4 p-6 lg:flex-row justify-between">
      <div className="flex justify-between items-center gap-2 w-full lg:w-1/2">
        <div className="flex items-center gap-2 lg:gap-4 text-xl md:text-2xl">
          <FontAwesomeIcon
            icon={faColumns}
            className="cursor-pointer"
            onClick={toggleNav}
          />
          <h2 className="font-semibold">Products</h2>
        </div>
        <p className="text-xs text-nowrap md:text-sm">{formattedDate}</p>
      </div>
      <div className="flex gap-4 items-center">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search product..."
            className="text-sm border border-gray-300 rounded-md pl-10 p-2 outline-none w-full md:text-base"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </section>
  );
}

export default ProductsHeader;
