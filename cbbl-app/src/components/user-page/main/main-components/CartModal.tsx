"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faX, faXmark } from "@fortawesome/free-solid-svg-icons";
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
    mediumPrice?: number;
    largePrice?: number;
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
  setCartItems: setParentCartItems,
  setCartCount,
}: CartModalProps) {
  const [currentStep, setCurrentStep] = useState(1); // 🔹 Step tracker (1 = items, 2 = seat/time, 3 = payment, 4 = confirmation)
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [selectedSeatName, setSelectedSeatName] = useState<string | null>(null);
  const [cartItemsState, setCartItems] = useState<CartItem[]>(cartItems);
  const [guestCount, setGuestCount] = useState(1);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (!selectedSeat) {
      setSelectedSeatName(null);
      return;
    }

    let mounted = true;

    interface Seat {
      id: string;
      name: string;
    }

    const fetchSeatName = async () => {
      try {
        const res = await fetch("/api/seats");
        const data: { success: boolean; seats: Seat[] } = await res.json();

        if (data?.success && Array.isArray(data.seats)) {
          const seat = data.seats.find((s) => s.id === selectedSeat);
          if (mounted) setSelectedSeatName(seat?.name ?? selectedSeat);
        } else {
          if (mounted) setSelectedSeatName(selectedSeat);
        }
      } catch {
        if (mounted) setSelectedSeatName(selectedSeat);
      }
    };

    fetchSeatName();
    return () => {
      mounted = false;
    };
  }, [selectedSeat]);

  if (!isOpen) return null;

  const total = cartItemsState.reduce((acc, item) => {
    let itemPrice = item.product.price;

    if (item.product.type === "DRINK" && item.size) {
      if (item.size === "medium" && item.product.mediumPrice != null)
        itemPrice += item.product.mediumPrice;
      else if (item.size === "large" && item.product.largePrice != null)
        itemPrice += item.product.largePrice;
    }

    return acc + itemPrice * item.quantity;
  }, 0);

  let reservationEndDisplay: Date | null = null;
  let seatCost = 0;

  if (selectedTime) {
    const start = new Date(selectedTime);
    let end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const closingTime = new Date(start);
    closingTime.setHours(22, 0, 0, 0);
    if (end > closingTime) end = closingTime;

    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    seatCost = hours * 10;
    reservationEndDisplay = end;
  }

  const grandTotal = total + seatCost;

  // ✅ Proceed handler
  const handlePreOrder = async () => {
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

    const now = new Date();
    const selectedDate = new Date(selectedTime);
    if (selectedDate.getHours() < 10 || selectedDate.getHours() >= 22) {
      alert("Please select a time between 10:00 AM and 10:00 PM.");
      return;
    }
    if (selectedDate < now) {
      alert("You can’t select a past time.");
      return;
    }

    const endTime = new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000);
    if (endTime.getHours() >= 22) {
      endTime.setHours(22, 0, 0, 0);
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

      const updatedCartItems = cartItemsState.filter(
        (item) => item.id !== cartItemCustomId
      );
      setCartItems(updatedCartItems);
      setParentCartItems(updatedCartItems);
      setCartCount(updatedCartItems.reduce((acc, i) => acc + i.quantity, 0));
    } catch (err) {
      console.error(err);
      alert("Failed to remove item");
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/20 p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl h-full p-6 rounded-xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4 border-b-2 pb-2 border-[#3C604C]">
          <h3 className="font-bold text-xl text-gray-800">
            {currentStep === 1 && "Your Cart"}
            {currentStep === 2 && "Seat Reservation"}
            {currentStep === 3 && "Payment"}
            {currentStep === 4 && "Order Summary"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Step 1 */}
          {currentStep === 1 && (
            <>
              {cartItemsState.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  Your cart is empty
                </p>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
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
                            let price = item.product.price;
                            if (item.product.type === "DRINK" && item.size) {
                              if (
                                item.size === "medium" &&
                                item.product.mediumPrice
                              )
                                price += item.product.mediumPrice;
                              else if (
                                item.size === "large" &&
                                item.product.largePrice
                              )
                                price += item.product.largePrice;
                            }
                            return (price * item.quantity).toFixed(2);
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
              )}
            </>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <SeatReservation
              selectedSeat={selectedSeat}
              setSelectedSeat={setSelectedSeat}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
            />
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <>
              <div className="w-full border border-gray-200 rounded-xl p-5 bg-gray-50 text-left space-y-3">
                <p className="flex justify-between font-medium text-gray-800">
                  <span>Subtotal</span>
                  <span>₱ {total.toFixed(2)}</span>
                </p>

                <div className="space-y-1">
                  <p className="flex justify-between text-gray-800">
                    <span>Reservation Fee</span>
                    <span>₱ {seatCost.toFixed(2)}</span>
                  </p>
                  {selectedTime && reservationEndDisplay && (
                    <p className="text-sm text-gray-600 text-right italic">
                      {new Date(selectedTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {reservationEndDisplay.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>

                <p className="flex justify-between text-lg border-t pt-3 mt-2 font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₱ {grandTotal.toFixed(2)}</span>
                </p>
              </div>
              <Payment setPaymentProof={setPaymentProof} />
            </>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-8 mb-8">
              {/* Ordered Items */}
              <div>
                <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  Selected Items
                </h4>
                <div className="flex flex-col gap-3">
                  {cartItemsState.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 border border-gray-200 rounded-xl bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={56}
                          height={56}
                          className="w-14 h-14 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.product.type === "DRINK"
                              ? `Size: ${item.size} | Qty: ${item.quantity}`
                              : `Qty: ${item.quantity}`}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-base">
                        ₱
                        {(() => {
                          let price = item.product.price;
                          if (item.product.type === "DRINK" && item.size) {
                            if (
                              item.size === "medium" &&
                              item.product.mediumPrice
                            )
                              price += item.product.mediumPrice;
                            else if (
                              item.size === "large" &&
                              item.product.largePrice
                            )
                              price += item.product.largePrice;
                          }
                          return (price * item.quantity).toFixed(2);
                        })()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reservation Details */}
              <div>
                <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  Reservation Details
                </h4>
                <div className="space-y-3 text-gray-700 bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <p>
                    <span className="font-medium text-gray-800">
                      Selected Seat:
                    </span>{" "}
                    {selectedSeatName ?? selectedSeat ?? "None"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Guests:</span>{" "}
                    {guestCount}
                  </p>
                  <p>
                    <span className="font-medium text-gray-800">Time:</span>{" "}
                    {selectedTime && reservationEndDisplay ? (
                      <span className="font-semibold text-gray-900">
                        {new Date(selectedTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {reservationEndDisplay.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>

              {/* Payment Proof */}
              {paymentProof && (
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                    Payment Screenshot
                  </h4>

                  <div className="relative w-full flex justify-center">
                    <div className="relative w-full max-w-[260px]">
                      <Image
                        src={paymentProof}
                        alt="Payment Proof"
                        width={260}
                        height={260}
                        className="rounded-xl border border-gray-200 w-full h-auto object-cover"
                        onClick={() => setExpandedImage(paymentProof)}
                      />

                      {/* Perfectly Rounded Expand Icon */}
                      <button
                        type="button"
                        className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center bg-white/60 text-gray-700 border border-gray-300 rounded-full hover:bg-white hover:text-[#3C604C] transition-colors"
                        onClick={() => setExpandedImage(paymentProof)}
                      >
                        <FontAwesomeIcon icon={faExpand} className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Expanded Image Section */}
              {expandedImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                  {/* Close button */}
                  <button
                    className="fixed top-5 right-5 w-10 h-10 flex items-center justify-center 
                 bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-600"
                    type="button"
                    onClick={() => setExpandedImage(null)}
                  >
                    <FontAwesomeIcon icon={faX} className="text-lg" />
                  </button>

                  {/* Image container */}
                  <div className="max-w-3xl max-h-[85vh] w-auto h-auto p-4 flex items-center justify-center">
                    <Image
                      src={expandedImage}
                      alt="Expanded payment screenshot"
                      width={800}
                      height={800}
                      className="max-w-full max-h-[80vh] object-contain rounded-lg"
                    />
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div>
                <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
                  Payment Summary
                </h4>
                <div className="w-full border border-gray-200 rounded-xl p-5 bg-gray-50 text-left space-y-3">
                  <p className="flex justify-between font-medium text-gray-800">
                    <span>Subtotal</span>
                    <span>₱ {total.toFixed(2)}</span>
                  </p>

                  <div className="space-y-1">
                    <p className="flex justify-between text-gray-800">
                      <span>Reservation Fee</span>
                      <span>₱ {seatCost.toFixed(2)}</span>
                    </p>
                    {selectedTime && reservationEndDisplay && (
                      <p className="text-sm text-gray-600 text-right italic">
                        {new Date(selectedTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {reservationEndDisplay.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                  </div>

                  <p className="flex justify-between text-lg border-t pt-3 mt-2 font-semibold text-gray-900">
                    <span>Total</span>
                    <span>₱ {grandTotal.toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer buttons */}
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 bg-white sticky bottom-0 pb-2">
          {currentStep === 1 && (
            <div className="flex justify-end w-full">
              <button
                onClick={() => setCurrentStep(2)}
                className="button-style"
              >
                Next
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="button-style"
              >
                Next
              </button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                className="button-style"
              >
                Next
              </button>
            </>
          )}

          {currentStep === 4 && (
            <>
              <button
                onClick={() => setCurrentStep(3)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Back
              </button>
              <button onClick={handlePreOrder} className="button-style">
                Confirm Order
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
