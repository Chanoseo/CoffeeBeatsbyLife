"use client";

import { faPlus, faAngleDown, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProductsList from "./ProductsList";
import AddProduct from "./AddProduct";
import { useState, useEffect } from "react";

function Products() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const handleToggle = () => {
    setShowAddProduct((prev) => !prev);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/products/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <section className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">Manage Products</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded-md pl-10 p-2 outline-none w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Custom Dropdown */}
          <div className="relative w-64">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between border border-gray-300 py-2 px-4 rounded outline-none bg-white"
            >
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Select Category"}
              <FontAwesomeIcon icon={faAngleDown} className="ml-4" />
            </button>

            {dropdownOpen && (
              <ul className="absolute w-full bg-white border border-gray-300 mt-1 rounded z-10">
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(""); // empty = default = show all
                    setDropdownOpen(false);
                  }}
                >
                  All Categories
                </li>
                {categories.map((cat) => (
                  <li
                    key={cat.id}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setDropdownOpen(false);
                    }}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleToggle}
            className="flex items-center justify-between gap-2 button-style w-40"
          >
            <span>Add Product</span>
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>

      {showAddProduct && <AddProduct onClose={handleToggle} />}
      <ProductsList
        selectedCategory={selectedCategory}
        searchInput={searchInput}
      />
    </section>
  );
}

export default Products;
