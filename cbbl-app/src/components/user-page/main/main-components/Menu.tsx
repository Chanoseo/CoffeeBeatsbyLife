"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import AddToCartButton from "./AddToCartButton";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isNew: boolean;
  isBestSeller: boolean;
};

type MenuProps = {
  selectedCategory?: string | null;
  searchQuery?: string;
};

function Menu({ selectedCategory, searchQuery }: MenuProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) return <p className="p-4 text-gray-600">Loading products...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;
  if (products.length === 0)
    return <p className="p-4 text-gray-600">No products available</p>;

  // Filter products based on search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes((searchQuery || "").toLowerCase())
  );

  if (filteredProducts.length === 0)
    return <p className="p-4 text-gray-600">No products match your search</p>;

  return (
    <div className="w-full p-4 bg-[#3C604C]/10 ml-4 rounded custom-scrollbar">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,auto))] gap-4 justify-center">
        {filteredProducts.map((product) => (
          <div key={product.id} className="relative bg-white rounded-xl shadow-sm shadow-black/20 w-52 h-auto flex flex-col overflow-hidden">
            {/* New / Best Seller badges */}
            <div className="flex gap-2 absolute top-2 right-2 z-10">
              {product.isNew && <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>}
              {product.isBestSeller && <span className="bg-[#E8E4C9] py-1 px-4 rounded">Best Seller</span>}
            </div>

            <Image
              src={product.imageUrl || "/default-image.jpg"}
              alt={product.name}
              width={200}
              height={200}
              className="w-full h-36 object-cover"
            />
            <div className="p-3 flex flex-col gap-3 text-left">
              <div>
                <h1 className="text-lg font-semibold">{product.name}</h1>
                <p className="text-xs mt-1">{product.description}</p>
                <p className="mt-2 underline text-xl">₱ {product.price}</p>
              </div>
              <AddToCartButton productId={product.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Menu;
