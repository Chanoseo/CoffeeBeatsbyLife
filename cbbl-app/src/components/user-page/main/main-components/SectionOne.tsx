"use client";

import { useState, useEffect } from "react";
import Menu from "./Menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

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
        setCategories(data);
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
      <div className="relative ml-56">
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

      <div className="flex gap-4 mt-6">
        <nav className="bg-[#3C604C]/10 h-fit p-4 rounded">
          <ul className="flex flex-col gap-2 text-lg">
            <li>
              <button
                className={`rounded py-2 px-4 w-40 text-left cursor-pointer transition ${
                  activeMenu === "All Menu"
                    ? "bg-[#3C604C]/100 font-semibold text-white"
                    : "hover:bg-[#3C604C]/10"
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
                    className={`rounded py-2 px-4 w-40 text-left cursor-pointer transition ${
                      activeMenu === category.name
                        ? "bg-[#3C604C]/100 font-semibold text-white"
                        : "hover:bg-[#3C604C]/10"
                    }`}
                    onClick={() => setActiveMenu(category.name)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
          </ul>
        </nav>

        <Menu
          selectedCategory={activeMenu === "All Menu" ? null : activeMenu}
          searchQuery={searchQuery}
        />
      </div>
    </section>
  );
}

export default SectionOne;
