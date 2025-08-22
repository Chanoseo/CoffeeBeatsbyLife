"use client";

import { useState } from "react";
import Menu from "./Menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

function SectionOne() {
  const [activeMenu, setActiveMenu] = useState("All Menu");

  const menus = [
    "All Menu",
    "Coffee",
    "Tea",
    "Pastries",
    "Sandwiches",
    "Specials",
  ];

  return (
    <section className="pt-25 pb-10">
      <div className="relative ml-56">
        <input
          type="text"
          placeholder="Search menu items..."
          className="border border-gray-300 rounded-md pl-10 p-2 outline-none w-full"
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>
      <div className="flex gap-4 mt-6">
        <nav className="bg-[#3C604C]/10 h-fit p-4 rounded">
          <ul className="flex flex-col gap-2 text-lg">
            {menus.map((menu) => (
              <li key={menu}>
                <button
                  className={`rounded py-2 px-4 w-40 text-left cursor-pointer transition ${
                    activeMenu === menu
                      ? "bg-[#3C604C]/100 rounded py-2 px-4 w-full text-left cursor-pointer font-semibold text-white"
                      : "hover:bg-[#3C604C]/10"
                  }`}
                  onClick={() => setActiveMenu(menu)}
                >
                  {menu}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <Menu />
      </div>
    </section>
  );
}

export default SectionOne;
