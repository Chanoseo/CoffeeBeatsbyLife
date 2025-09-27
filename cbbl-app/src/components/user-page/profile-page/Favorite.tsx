"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AddToCartButton from "../main/main-components/AddToCartButton";

export type CartItem = {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    type: "FOOD" | "DRINK";
  };
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isNew: boolean;
  isBestSeller: boolean;
  type: "FOOD" | "DRINK";
};

type FavoriteProps = {
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
};

function Favorite({ setCartItems, setCartCount }: FavoriteProps) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasPreOrder, setHasPreOrder] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/favorites/list");
        const data = await res.json();
        setFavorites(data.favorites || []);
      } catch (err) {
        console.error("Error loading favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  useEffect(() => {
    const checkPreOrder = async () => {
      try {
        const res = await fetch("/api/orders/check");
        if (res.ok) {
          const data = await res.json();
          setHasPreOrder(data.hasPreOrder);
        }
      } catch (err) {
        console.error("Failed to check pre-order:", err);
      }
    };
    checkPreOrder();
  }, []);

  return (
    <div className="w-full p-4 bg-[#f9fafb] rounded custom-scrollbar mt-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 text-left">
        Favorites
      </h2>

      {loading ? (
        <p className="text-gray-600">Loading favorites...</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-600">No favorites yet</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-start">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-xl shadow-sm shadow-black/20 w-52 h-auto flex flex-col overflow-hidden"
            >
              {/* Badges */}
              <div className="flex gap-2 absolute top-2 right-2 z-10">
                {product.isNew && (
                  <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
                )}
                {product.isBestSeller && (
                  <span className="bg-[#E8E4C9] py-1 px-4 rounded">
                    Best Seller
                  </span>
                )}
              </div>

              {/* Product Image */}
              <Image
                src={product.imageUrl || "/default-image.jpg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-36 object-cover"
              />

              {/* Content */}
              <div className="p-3 h-full flex flex-col gap-3 text-left">
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">{product.name}</h1>
                  <p className="text-xs mt-1 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="mt-2 underline text-xl">₱ {product.price}</p>
                </div>

                {/* Add to Cart */}
                <AddToCartButton
                  product={product}
                  setCartItems={setCartItems}
                  setCartCount={setCartCount}
                  hasPreOrder={hasPreOrder}
                  onFavoriteToggle={(id, favorited) => {
                    if (!favorited) {
                      setFavorites((prev) => prev.filter((p) => p.id !== id));
                    }
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorite;
