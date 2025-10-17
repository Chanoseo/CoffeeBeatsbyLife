"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import SeatReservation from "./SeatReservation";
import Payment from "./Payment";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartItems from "./cartmodal-components/CartItems";
import PriceSummary from "./cartmodal-components/PriceSummary";
import OrderSummary from "./cartmodal-components/OrderSummary";

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
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [selectedSeatNames, setSelectedSeatNames] = useState<string[]>([]);
  const [cartItemsState, setCartItems] = useState<CartItem[]>(cartItems);
  const [guestCount, setGuestCount] = useState(1);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCartItems(cartItems);
  }, [cartItems]);

  useEffect(() => {
    if (selectedSeats.length === 0) {
      setSelectedSeatNames([]);
      return;
    }

    let mounted = true;

    interface Seat {
      id: string;
      name: string;
    }

    const fetchSeatNames = async () => {
      try {
        const res = await fetch("/api/seats");
        const data: { success: boolean; seats: Seat[] } = await res.json();
        if (data.success && Array.isArray(data.seats)) {
          const names = selectedSeats.map(
            (id) => data.seats.find((s) => s.id === id)?.name ?? id
          );
          if (mounted) setSelectedSeatNames(names);
        } else {
          if (mounted) setSelectedSeatNames(selectedSeats);
        }
      } catch {
        if (mounted) setSelectedSeatNames(selectedSeats);
      }
    };

    fetchSeatNames();
    return () => {
      mounted = false;
    };
  }, [selectedSeats]);

  // 🔹 Live validation effect
  useEffect(() => {
    if (cartItemsState.length === 0) {
      setErrorMessage("Your cart is empty.");
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMessage("Please select at least one seat.");
      return;
    }

    if (!selectedTime) {
      setErrorMessage("Please select a time.");
      return;
    }

    if (!paymentProof) {
      setErrorMessage("Please upload a payment screenshot.");
      return;
    }

    const now = new Date();
    const selectedDate = new Date(selectedTime);

    if (selectedDate.getHours() < 10 || selectedDate.getHours() >= 22) {
      setErrorMessage("Please select a time between 10:00 AM and 10:00 PM.");
      return;
    }

    if (selectedDate < now) {
      setErrorMessage("You can't select a past time.");
      return;
    }

    (async () => {
      try {
        const seatsRes = await fetch("/api/seats");
        const seatsData = await seatsRes.json();
        const seatsList: { id: string; capacity?: number }[] = Array.isArray(
          seatsData?.seats
        )
          ? seatsData.seats
          : [];

        const totalSelectedCapacity = selectedSeats.reduce((sum, id) => {
          const s = seatsList.find((seat) => seat.id === id);
          return sum + (s?.capacity ?? 0);
        }, 0);

        if (totalSelectedCapacity < guestCount) {
          setErrorMessage(
            `Selected seats capacity (${totalSelectedCapacity}) is insufficient for guests (${guestCount}).`
          );
          return;
        }

        const totalCartQuantity = cartItemsState.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const diff = totalSelectedCapacity - totalCartQuantity;

        if (diff > 0) {
          setErrorMessage(
            `The selected seat(s) require a total of ${totalSelectedCapacity} item${
              totalSelectedCapacity > 1 ? "s" : ""
            }. Kindly add ${diff} more item${
              diff > 1 ? "s" : ""
            } to complete your reservation.`
          );
          return;
        }

        // No error if diff <= 0
        setErrorMessage(null);
      } catch (err) {
        console.error("Failed to validate seats:", err);
        setErrorMessage("Failed to validate seats. Please try again.");
      }
    })();
  }, [selectedSeats, selectedTime, paymentProof, guestCount, cartItemsState]);

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
    // Stop if any validation error exists
    if (errorMessage || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItemsState,
          seat: selectedSeats,
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
    } catch (err) {
      console.error("Order submission failed:", err);
      alert("Failed to submit order. Please try again.");
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
    <div className="fixed inset-0 w-full h-full flex justify-center items-center bg-black/20 md:p-4 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl h-full p-6 md:rounded-xl border border-gray-200 flex flex-col">
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
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
          {/* Step 1 */}
          {currentStep === 1 && (
            <CartItems
              cartItems={cartItemsState}
              handleRemoveItem={handleRemoveItem}
            />
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <SeatReservation
              selectedSeats={selectedSeats}
              setSelectedSeats={setSelectedSeats}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
            />
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <>
              <PriceSummary
                total={total}
                seatCost={seatCost}
                grandTotal={grandTotal}
                selectedTime={selectedTime}
                reservationEndDisplay={reservationEndDisplay}
              />
              <Payment setPaymentProof={setPaymentProof} />
            </>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <OrderSummary
              cartItems={cartItemsState}
              selectedSeats={selectedSeats}
              selectedSeatNames={selectedSeatNames}
              guestCount={guestCount}
              selectedTime={selectedTime}
              reservationEndDisplay={reservationEndDisplay}
              paymentProof={paymentProof}
              expandedImage={expandedImage}
              setExpandedImage={setExpandedImage}
              total={total}
              seatCost={seatCost}
              grandTotal={grandTotal}
              errorMessage={errorMessage}
            />
          )}
        </div>

        {/* Sticky footer buttons */}
        {cartItemsState.length > 0 && (
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
                <button
                  onClick={handlePreOrder}
                  className={`button-style ${
                    isSubmitting || errorMessage
                      ? "bg-gray-200 text-gray-800 cursor-not-allowed"
                      : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Confirm Order"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
