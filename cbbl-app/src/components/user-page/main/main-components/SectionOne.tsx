"use client";

import { useState, useEffect } from "react";
import Menu from "./Menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

type Category = {
  id: string;
  name: string;
};

function SectionOne() {
  const [activeMenu, setActiveMenu] = useState("All Menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/products/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();

        // ✅ Sort alphabetically (case-insensitive)
        const sorted = data.sort((a, b) =>
          a.name.localeCompare(b.name, "en", { sensitivity: "base" })
        );

        setCategories(sorted);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="pt-25 pb-10">
      <div className="flex flex-col justify-center">
        <div className="flex gap-4 items-center justify-end">
          {/* Search Menu */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search menu items..."
              className="border border-gray-300 rounded-md pl-10 p-2 outline-none w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <div className="relative inline-block">
            <FontAwesomeIcon icon={faCartShopping} className="text-2xl" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
              1
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-[#3C604C]/10 mt-6 p-4 w-full rounded">
          <ul className="flex flex-wrap gap-3 justify-center">
            <li>
              <button
                className={`rounded-lg py-2 px-5 transition text-sm sm:text-base ${
                  activeMenu === "All Menu"
                    ? "bg-[#3C604C] font-semibold text-white"
                    : "bg-white hover:bg-[#3C604C]/20"
                }`}
                onClick={() => setActiveMenu("All Menu")}
              >
                All Menu
              </button>
            </li>

            {!loading &&
              categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={`rounded-lg py-2 px-5 transition text-sm sm:text-base ${
                      activeMenu === category.name
                        ? "bg-[#3C604C] font-semibold text-white"
                        : "bg-white hover:bg-[#3C604C]/20"
                    }`}
                    onClick={() => setActiveMenu(category.name)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
          </ul>
        </nav>
      </div>

      <div className="mt-6">
        <Menu
          selectedCategory={activeMenu === "All Menu" ? null : activeMenu}
          searchQuery={searchQuery}
        />
      </div>
    </section>
  );
}

export default SectionOne;
