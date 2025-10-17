"use client";

import { useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

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
  price: number; // small price
  mediumPrice?: number | null;
  largePrice?: number | null;
  imageUrl: string;
  type: "FOOD" | "DRINK";
};

type AddToCartButtonProps = {
  product: Product;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
  hasPreOrder: boolean;
};

export default function AddToCartButton({
  product,
  setCartItems,
  setCartCount,
  hasPreOrder,
}: AddToCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState("small");
  const [quantity, setQuantity] = useState<string>("1");
  const [isAdding, setIsAdding] = useState(false);

  // ✅ Compute price based on selected size (add medium/large price to base price)
  const displayPrice = (() => {
    let price = product.price; // start with small/base price

    if (product.type === "DRINK") {
      if (size === "medium" && product.mediumPrice != null)
        price += product.mediumPrice;
      if (size === "large" && product.largePrice != null)
        price += product.largePrice;
    }

    return price;
  })();

  const handleAddToCart = async () => {
    if (isAdding) return;
    setIsAdding(true);

    try {
      type CartRequestBody =
        | { productId: string; quantity: number }
        | { productId: string; quantity: number; size: string };

      let body: CartRequestBody = {
        productId: product.id,
        quantity: Number(quantity) || 1,
      };

      if (product.type === "DRINK") {
        body = { ...body, size };
      }

      const res = await fetch("/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add to cart");

      const data: { items: CartItem[] } = await res.json();

      if (data.items) {
        setCartItems(data.items);
        const totalItems = data.items.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        setCartCount(totalItems);
      }

      // reset state after confirm
      setSize("small");
      setQuantity("1");
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          className={`button-style w-full ${
            hasPreOrder ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !hasPreOrder && setIsOpen(true)}
          disabled={hasPreOrder}
        >
          {hasPreOrder ? "Pre-Order Active" : "Add to Cart"}
        </button>
      </div>

      {isOpen && (
        <div className="fixed p-4 inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-96 relative">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <FontAwesomeIcon
                icon={faX}
                className="text-lg"
                onClick={() => setIsOpen(false)}
              />
            </div>

            {/* Product Info */}
            <div>
              <div className="bg-gray-200 rounded">
                <Image
                  src={product.imageUrl || "/default-image.jpg"}
                  alt={product.name}
                  width={180}
                  height={180}
                  className="rounded-xl object-cover w-full h-44"
                  priority
                />
              </div>
              <h2 className="text-xl font-semibold mt-4">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {product.description}
              </p>
              <p className="text-lg font-bold mt-2 text-[#3C604C]">
                ₱ {displayPrice.toFixed(2)}
              </p>
            </div>

            {/* Drink Sizes */}
            {product.type === "DRINK" && (
              <div className="mt-6">
                <h3 className="text-md font-medium mb-2">Choose Size</h3>
                <div className="flex gap-2">
                  {["small", "medium", "large"].map((s) => (
                    <label
                      key={s}
                      className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition-all ${
                        size === s
                          ? "bg-[#3C604C] text-white border-[#3C604C]"
                          : "border-gray-300 hover:border-[#3C604C]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="size"
                        value={s}
                        checked={size === s}
                        onChange={(e) => setSize(e.target.value)}
                        className="hidden"
                      />
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2 text-gray-700">
                Quantity
              </h3>
              <div className="flex items-center gap-2 w-full border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() =>
                    setQuantity((prev) => String(Math.max(1, Number(prev) - 1)))
                  }
                  className="w-10 h-10 bg-gray-100 text-[#3C604C] flex items-center justify-center font-bold text-lg hover:bg-[#3C604C] hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center text-lg font-semibold text-gray-900">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((prev) => String(Number(prev) + 1))
                  }
                  className="w-10 h-10 bg-gray-100 text-[#3C604C] flex items-center justify-center font-bold text-lg hover:bg-[#3C604C] hover:text-white transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleAddToCart}
              className="button-style mt-6 w-full"
              disabled={isAdding}
            >
              {isAdding ? "Adding..." : "Confirm Add to Cart"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
