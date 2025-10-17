// RateButton.tsx
"use client";
import { useState } from "react";
import Rate from "./Rate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

type Product = {
  id: string;
  name: string;
  imageUrl: string;
};

type OrderItem = {
  id: string;
  product: Product;
};

function RateButton({
  orderId,
  items,
}: {
  orderId: string;
  items: OrderItem[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(true)} className="button-style">
        Rate
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 md:rounded-xl shadow-lg relative w-full h-full md:w-[28rem] md:max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl">Feedback</h1>
              <FontAwesomeIcon icon={faX} onClick={() => setOpen(false)} />
            </div>

            {/* ✅ Pass typed items */}
            <Rate orderId={orderId} items={items} />
          </div>
        </div>
      )}
    </div>
  );
}

export default RateButton;
