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

  const total = cartItemsState.reduce((acc, item) => {
    let itemPrice = item.product.price;

    // Adjust for drink size
    if (item.product.type === "DRINK" && item.size) {
      if (item.size === "medium" && item.product.mediumPrice != null) {
        itemPrice += item.product.mediumPrice;
      } else if (item.size === "large" && item.product.largePrice != null) {
        itemPrice += item.product.largePrice;
      }
    }

    return acc + itemPrice * item.quantity;
  }, 0);

  // ✅ Add seat cost based on selectedTime and 2-hour duration
  let seatCost = 0;
  if (selectedTime) {
    const start = new Date(selectedTime);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    seatCost = hours * 10; // ₱10 per hour
  }

  const grandTotal = total + seatCost;

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
                      ₱
                      {(() => {
                        let itemPrice = item.product.price;
                        if (item.product.type === "DRINK" && item.size) {
                          if (
                            item.size === "medium" &&
                            item.product.mediumPrice != null
                          ) {
                            itemPrice += item.product.mediumPrice;
                          } else if (
                            item.size === "large" &&
                            item.product.largePrice != null
                          ) {
                            itemPrice += item.product.largePrice;
                          }
                        }
                        return (itemPrice * item.quantity).toFixed(2);
                      })()}
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

            <div className="border-t-2 border-b-2 border-[#3C604C] w-full mt-6 py-4">
              <div className="w-full p-4 rounded-lg border border-gray-200 space-y-2 font-semibold text-gray-800">
                <p className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₱ {total.toFixed(2)}</span>
                </p>
                <p className="flex justify-between items-start">
                  <span className="flex flex-col">
                    <span className="font-medium text-gray-800">Seat</span>
                    {selectedTime && (
                      <span className="text-sm text-gray-500 mt-0.5">
                        {new Date(selectedTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(
                          new Date(selectedTime).getTime() + 2 * 60 * 60 * 1000
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-gray-800">
                    ₱ {seatCost.toFixed(2)}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6">
              <p className="font-semibold text-lg text-gray-800">
                <span>Total: ₱{grandTotal.toFixed(2)}</span>
              </p>
              <button
                className="button-style mt-4 sm:mt-0"
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
