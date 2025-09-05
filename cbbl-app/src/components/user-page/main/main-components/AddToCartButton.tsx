"use client";

import { useState } from "react";
import Image from "next/image";

type CartItem = {
  id: string;
  productId: string;
  size: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
};

type AddToCartButtonProps = {
  product: Product;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
  hasPreOrder: boolean; // ✅ new prop
};

export default function AddToCartButton({
  product,
  setCartItems,
  setCartCount,
  hasPreOrder,
}: AddToCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState("small");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size,
          quantity,
        }),
      });

      if (!res.ok) throw new Error("Failed to add to cart");

      // ✅ Get updated cart items from backend
      const data: { items: CartItem[] } = await res.json();

      if (data.items) {
        // ✅ Update cart state with actual items from backend
        setCartItems(data.items);

        // ✅ Update cart count
        const totalItems = data.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        setCartCount(totalItems);
      }

      setIsOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <button
        className={`button-style ${
          hasPreOrder ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => !hasPreOrder && setIsOpen(true)}
        disabled={hasPreOrder}
      >
        {hasPreOrder ? "Pre-Order Active" : "Add to Cart"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>

            <div className="flex flex-col items-center text-center">
              <Image
                src={product.imageUrl || "/default-image.jpg"}
                alt={product.name}
                width={150}
                height={150}
                className="rounded-md object-cover w-36 h-36"
              />
              <h2 className="text-xl font-semibold mt-4">{product.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {product.description}
              </p>
              <p className="text-lg font-bold mt-2">₱ {product.price}</p>
            </div>

            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Choose Size</h3>
              <div className="flex gap-4">
                {["small", "medium", "large"].map((s) => (
                  <label key={s} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="size"
                      value={s}
                      checked={size === s}
                      onChange={(e) => setSize(e.target.value)}
                    />
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Quantity</h3>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-20 border rounded p-1 text-center"
              />
            </div>

            <button
              onClick={handleAddToCart}
              className="button-style mt-4 w-full"
            >
              Confirm Add to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
