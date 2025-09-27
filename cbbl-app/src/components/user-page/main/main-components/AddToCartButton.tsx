"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart, faX } from "@fortawesome/free-solid-svg-icons";

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
    type: "FOOD" | "DRINK";
  };
};

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  type: "FOOD" | "DRINK";
};

type AddToCartButtonProps = {
  product: Product;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  setCartCount: React.Dispatch<React.SetStateAction<number>>;
  hasPreOrder: boolean;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
};

export default function AddToCartButton({
  product,
  setCartItems,
  setCartCount,
  hasPreOrder,
  onFavoriteToggle,
}: AddToCartButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState("small");
  const [quantity, setQuantity] = useState<string>("1");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const res = await fetch(`/api/favorites?productId=${product.id}`);
        const data = await res.json();
        if (data.favorited !== undefined) {
          setIsFavorite(data.favorited);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFavoriteStatus();
  }, [product.id]);

  const handleAddToCart = async () => {
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
    }
  };

  const toggleFavorite = async () => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.favorited);

        // ✅ Tell parent (Favorite) immediately
        if (onFavoriteToggle) {
          onFavoriteToggle(product.id, data.favorited);
        }
      }
    } catch (err) {
      console.error(err);
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

        <FontAwesomeIcon
          icon={faHeart}
          onClick={toggleFavorite}
          className={`text-2xl cursor-pointer transition-colors duration-200 ${
            isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-500"
          }`}
        />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
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
              <Image
                src={product.imageUrl || "/default-image.jpg"}
                alt={product.name}
                width={180}
                height={180}
                className="rounded-xl object-cover w-full h-44"
              />
              <h2 className="text-xl font-semibold mt-4">{product.name}</h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {product.description}
              </p>
              <p className="text-lg font-bold mt-2 text-[#3C604C]">
                ₱ {product.price}
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
              <h3 className="text-md font-medium mb-2">Quantity</h3>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow empty string for smooth typing
                  if (val === "" || /^[0-9]+$/.test(val)) {
                    setQuantity(val);
                  }
                }}
                className="w-full border rounded-xl p-2 text-center focus:outline-none"
              />
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleAddToCart}
              className="button-style mt-6 w-full"
            >
              Confirm Add to Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}
