"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";
import FavoriteButton from "./FavoriteButton";

export type CartItem = {
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

type MenuProps = {
  selectedCategory?: string | null;
  searchQuery?: string;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
};

function Menu({
  selectedCategory,
  searchQuery,
  setCartItems,
  setCartCount,
}: MenuProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPreOrder, setHasPreOrder] = useState<boolean>(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = selectedCategory
          ? `/api/products?category=${encodeURIComponent(selectedCategory)}`
          : "/api/products";

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch products");

        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Fetch pre-order status **once per page load**
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

  if (loading) return <p className="p-4 text-gray-600">Loading products...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (products.length === 0)
    return <p className="p-4 text-gray-600">No products available</p>;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  const sortedProducts = filteredProducts.sort((a, b) => {
    if (a.isNew && a.isBestSeller && !(b.isNew && b.isBestSeller)) return -1;
    if (b.isNew && b.isBestSeller && !(a.isNew && a.isBestSeller)) return 1;
    if (a.isNew && !b.isNew) return -1;
    if (!a.isNew && b.isNew) return 1;
    if (a.isBestSeller && !b.isBestSeller) return -1;
    if (!a.isBestSeller && b.isBestSeller) return 1;
    return 0;
  });

  if (sortedProducts.length === 0)
    return <p className="p-4 text-gray-600">No products match your search</p>;

  return (
    <div className="w-full p-4 bg-[#3C604C]/10 rounded custom-scrollbar">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,auto))] gap-4 justify-center">
        {sortedProducts.map((product) => (
          <div
            key={product.id}
            className="relative bg-white rounded-xl shadow-sm shadow-black/20 w-52 h-auto flex flex-col overflow-hidden"
          >
            <div className="absolute top-3 right-3 z-10">
              <FavoriteButton productId={product.id} />
            </div>
            <div className="bg-gray-200">
              <Image
                src={product.imageUrl || "/cbbl-image.jpg"}
                alt={product.name}
                width={200}
                height={200}
                className="w-full h-36 object-cover"
                priority
              />
            </div>

            <div className="p-3 h-full flex flex-col gap-3 text-left">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">
                    {product.name}
                  </h1>

                  {product.isNew && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium py-1 px-3 rounded-full">
                      New
                    </span>
                  )}

                  {product.isBestSeller && (
                    <span className="bg-yellow-100 text-yellow-700 text-xs font-medium py-1 px-3 rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 line-clamp-2">
                  {product.description}
                </p>
              </div>
              <p className="mt-2 underline text-xl">₱ {product.price}</p>

              <AddToCartButton
                product={product}
                setCartItems={setCartItems}
                setCartCount={setCartCount}
                hasPreOrder={hasPreOrder} // ✅ pass pre-order status
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;
