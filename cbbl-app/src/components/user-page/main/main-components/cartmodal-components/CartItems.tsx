"use client";

import Image from "next/image";
import type { CartItem } from "../CartModal";
import { useState } from "react";

interface Step1CartItemsProps {
  cartItems: CartItem[];
  handleRemoveItem: (id: string) => void;
}

export default function Step1CartItems({
  cartItems,
  handleRemoveItem,
}: Step1CartItemsProps) {
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>(
    {}
  );

  if (cartItems.length === 0)
    return <p className="text-gray-500 text-center py-6">Your cart is empty</p>;

  const onRemove = async (id: string) => {
    if (removingItems[id]) return; // prevent multiple clicks
    setRemovingItems((prev) => ({ ...prev, [id]: true }));

    try {
      await handleRemoveItem(id);
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Failed to remove item");
    } finally {
      setRemovingItems((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      {cartItems.map((item) => {
        let price = item.product.price;
        if (item.product.type === "DRINK" && item.size) {
          if (item.size === "medium" && item.product.mediumPrice)
            price += item.product.mediumPrice;
          else if (item.size === "large" && item.product.largePrice)
            price += item.product.largePrice;
        }

        return (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="font-medium text-gray-800">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  {item.product.type === "DRINK"
                    ? `Size: ${item.size} | Qty: ${item.quantity}`
                    : `Qty: ${item.quantity}`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="font-semibold text-gray-800">
                ₱{(price * item.quantity).toFixed(2)}
              </p>
              <button
                className="text-red-500 text-xs hover:underline mt-1"
                onClick={() => onRemove(item.id)}
                disabled={removingItems[item.id]}
              >
                {removingItems[item.id] ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
