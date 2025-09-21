"use client";

import { faPlus, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ProductsList from "./ProductsList";
import AddProduct from "./AddProduct";
import { useState, useEffect } from "react";

interface ProductsProps {
  searchInput: string;
}

function Products({ searchInput }: ProductsProps) {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 🔄 trigger refresh for ProductsList
  const [refreshKey, setRefreshKey] = useState(0);

  const handleToggle = () => {
    setShowAddProduct((prev) => !prev);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1); // re-render ProductsList
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
    <section className="products-card">
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg lg:text-xl xl:text-2xl">Manage Products</h1>
        <div className="flex flex-col gap-4 items-end md:flex-row">
          {/* Custom Dropdown */}
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex justify-between items-center border border-gray-300 px-4 py-2 rounded outline-none bg-white text-sm lg:text-base"
            >
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name
                : "Select Category"}
              <FontAwesomeIcon icon={faAngleDown} className="ml-1" />
            </button>

            {dropdownOpen && (
              <ul className="absolute w-full bg-white border border-gray-300 mt-2 rounded z-50 text-sm lg:text-base">
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
          {/* Add Product Button */}
          <button
            onClick={handleToggle}
            className="bg-[#3C604C] text-sm text-white px-4 py-2 rounded cursor-pointer hover:bg-[#2F4A3A] transition-colors duration-200 ease-linear w-fit text-nowrap lg:text-base"
          >
            <span>Add Product</span>
            <FontAwesomeIcon icon={faPlus} className="ml-2" />
          </button>
        </div>
      </div>

      {/* ✅ Pass onRefresh */}
      {showAddProduct && (
        <AddProduct onClose={handleToggle} onRefresh={handleRefresh} />
      )}

      <ProductsList
        key={refreshKey} // forces re-render when refreshKey changes
        selectedCategory={selectedCategory}
        searchInput={searchInput}
      />
    </section>
  );
}

export default Products;
