"use client";

import { useState } from "react";
import Image from "next/image";

type ProductProps = {
  product: {
    id: string;
    name: string;
    description?: string | null;
    price: number;
    imageUrl: string;
  };
};

function AddToCartButton({ product }: ProductProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [size, setSize] = useState<string>("small");
  const [quantity, setQuantity] = useState<number>(1);

  const handleAddToCart = () => {
    console.log("Product:", product.name);
    console.log("Size:", size);
    console.log("Quantity:", quantity);
    setIsOpen(false); // close modal after action
  };

  return (
    <>
      <button className="button-style" onClick={() => setIsOpen(true)}>
        Add to Cart
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>

            {/* Product Details */}
            <div className="flex flex-col items-center text-center">
              <Image
                src={product.imageUrl || "/default-image.jpg"}
                alt={product.name}
                width={150}
                height={150}
                className="rounded-md object-cover"
              />
              <h2 className="text-xl font-semibold mt-4">{product.name}</h2>
              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
              <p className="text-lg font-bold mt-2">₱ {product.price}</p>
            </div>

            {/* Options */}
            <div className="mt-6">
              <h3 className="text-md font-medium mb-2">Choose Size</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="size"
                    value="small"
                    checked={size === "small"}
                    onChange={(e) => setSize(e.target.value)}
                  />
                  Small
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="size"
                    value="medium"
                    checked={size === "medium"}
                    onChange={(e) => setSize(e.target.value)}
                  />
                  Medium
                </label>
                <label className="flex items-center gap-1">
                  <input
                    type="radio"
                    name="size"
                    value="large"
                    checked={size === "large"}
                    onChange={(e) => setSize(e.target.value)}
                  />
                  Large
                </label>
              </div>
            </div>

            {/* Quantity */}
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

            {/* Confirm button */}
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

export default AddToCartButton;
