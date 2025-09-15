"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import SeatReservation from "./SeatReservation";
import Payment from "./Payment";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  setCartItems: (items: CartItem[]) => void;
  setCartCount: (count: number) => void;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  setCartItems: setParentCartItems, // rename to avoid conflict
  setCartCount,
}: CartModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [cartItemsState, setCartItems] = useState<CartItem[]>(cartItems);
  const [guestCount, setGuestCount] = useState(1);
  const router = useRouter();

  // ✅ Sync cartItemsState whenever cartItems prop changes
  useEffect(() => {
    setCartItems(cartItems);
  }, [cartItems]);

  if (!isOpen) return null;

  const total = cartItemsState.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handlePreOrder = async () => {
    // ✅ Validation
    if (!selectedSeat) {
      alert("Please select a seat before proceeding.");
      return;
    }

    if (!selectedTime) {
      alert("Please select a time before proceeding.");
      return;
    }

    if (!paymentProof) {
      alert("Please upload a payment screenshot before proceeding.");
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cartItems: cartItemsState,
        seat: selectedSeat,
        time: selectedTime,
        paymentProof,
        guestCount,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      onClose();
      router.push(`/home/orders/order-details?id=${data.id}`);
    } else {
      const { error } = await res.json();
      alert("Failed: " + error);
    }
  };

  const handleRemoveItem = async (cartItemCustomId: string) => {
    try {
      const res = await fetch(`/api/cart/${cartItemCustomId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Failed to remove item");
      }

      // ✅ remove item locally in modal
      const updatedCartItems = cartItemsState.filter(
        (item) => item.id !== cartItemCustomId
      );
      setCartItems(updatedCartItems);

      // ✅ update parent state
      setParentCartItems(updatedCartItems);
      setCartCount(
        updatedCartItems.reduce((acc, item) => acc + item.quantity, 0)
      );
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/20 p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl h-full p-6 rounded-xl border border-gray-200 overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b-2 pb-2 border-[#3C604C]">
          <h3 className="font-bold text-xl text-gray-800">Your Cart</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {cartItemsState.length === 0 ? (
          <p className="text-gray-500 text-center py-6">Your cart is empty</p>
        ) : (
          <>
            <div className="h-fit max-h-1/2 overflow-y-auto flex flex-col gap-4 mb-6">
              {cartItemsState.map((item) => (
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
                      <p className="font-medium text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.product.type === "DRINK"
                          ? `Size: ${item.size} | Qty: ${item.quantity}`
                          : `Qty: ${item.quantity}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <p className="font-semibold text-gray-800">
                      ₱{(item.product.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      className="text-red-500 text-xs hover:underline mt-1"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <SeatReservation
                selectedSeat={selectedSeat}
                setSelectedSeat={setSelectedSeat}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                guestCount={guestCount}
                setGuestCount={setGuestCount}
              />
              <Payment setPaymentProof={setPaymentProof} />
            </div>

            <div className="border-t-2 border-[#3C604C] mt-6 pt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <p className="font-semibold text-lg text-gray-800">
                Total: ₱{total.toFixed(2)}
              </p>
              <button
                className="w-full sm:w-auto bg-[#3C604C] text-white px-6 py-2 rounded-lg hover:bg-[#2d4638] transition-colors"
                onClick={handlePreOrder}
              >
                Pre-Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
