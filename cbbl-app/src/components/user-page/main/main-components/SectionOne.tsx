"use client";

import { useState, useEffect } from "react";
import Menu from "./Menu";
import CartModal from "./CartModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";
import BusyStatus from "./BusyStatus";

type Category = {
  id: string;
  name: string;
};

type CartItem = {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    type: "FOOD" | "DRINK";
    mediumPrice?: number; // optional
    largePrice?: number; // optional
  };
};

type StoreStatusType = "open" | "closed" | "busy";

function SectionOne() {
  const [activeMenu, setActiveMenu] = useState("All Menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartOpen, setCartOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState<StoreStatusType | null>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/products/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data: Category[] = await res.json();

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

  // Fetch cart items & count
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data: { items: CartItem[] } = await res.json();

        setCartItems(data.items);

        const totalItems =
          data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

        setCartCount(totalItems);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCart();
  }, []);

  // Fetch store status (for busy notifications)
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to fetch store status");
        const data = await res.json();

        if (
          data.storeStatus === "open" ||
          data.storeStatus === "closed" ||
          data.storeStatus === "busy"
        ) {
          setStoreStatus(data.storeStatus);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="pt-15 md:pt-25 md:pb-10">
      {/* Show BusyStatus only if the store is busy */}
      {storeStatus === "busy" && <BusyStatus />}

      <div className="flex flex-col justify-center">
        <div className="flex gap-4 items-center justify-end">
          {/* Search Menu */}
          <div className="relative w-full">
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

          {/* Cart Icon */}
          <div className="relative inline-block">
            <button onClick={() => setCartOpen((prev) => !prev)}>
              <FontAwesomeIcon icon={faCartShopping} className="text-2xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Cart Modal */}
        <CartModal
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setCartCount={setCartCount}
        />

        {/* Navigation */}
        <nav className="bg-[rgba(60,96,76,0.1)] mt-6 p-4 w-full rounded">
          <div className="overflow-x-auto scrollbar-hide">
            <ul className="flex flex-nowrap gap-3">
              <li>
                <button
                  className={`rounded-lg py-2 px-5 transition text-nowrap text-sm sm:text-base ${
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
                      className={`rounded-lg py-2 px-5 transition text-nowrap text-sm sm:text-base ${
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
          </div>
        </nav>
      </div>

      <div className="mt-6">
        <Menu
          selectedCategory={activeMenu === "All Menu" ? null : activeMenu}
          searchQuery={searchQuery}
          setCartItems={setCartItems}
          setCartCount={setCartCount}
        />
      </div>
    </section>
  );
}

export default SectionOne;
