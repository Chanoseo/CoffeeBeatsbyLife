"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faX } from "@fortawesome/free-solid-svg-icons";
import PriceSummary from "./PriceSummary";

interface CartItem {
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
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  selectedSeats: string[]; // ✅ multiple seats
  selectedSeatNames: string[]; // ✅ human-readable names
  guestCount: number;
  selectedTime: string | null;
  reservationEndDisplay: Date | null;
  paymentProof: string | null;
  expandedImage: string | null;
  setExpandedImage: (src: string | null) => void;
  total: number;
  seatCost: number;
  grandTotal: number;
  errorMessage?: string | null;
}

export default function OrderSummary({
  cartItems,
  selectedSeats,
  selectedSeatNames,
  guestCount,
  selectedTime,
  reservationEndDisplay,
  paymentProof,
  expandedImage,
  setExpandedImage,
  total,
  seatCost,
  grandTotal,
  errorMessage,
}: OrderSummaryProps) {
  return (
    <div className="flex flex-col gap-8 mb-8">
      {errorMessage && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
          {errorMessage}
        </div>
      )}

      {/* Ordered Items */}
      <div>
        <h4 className="font-semibold text-lg text-gray-900 mb-3 border-b border-gray-200 pb-1">
          Selected Items
        </h4>
        <div className="flex flex-col gap-3">
          {cartItems.map((item) => (
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
                    if (item.size === "medium" && item.product.mediumPrice)
                      price += item.product.mediumPrice;
                    else if (item.size === "large" && item.product.largePrice)
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
            <span className="font-medium text-gray-800">Selected Seats:</span>{" "}
            {selectedSeatNames.length > 0
              ? selectedSeatNames.join(", ")
              : selectedSeats.join(", ") || "None"}
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
          <button
            className="fixed top-5 right-5 w-10 h-10 flex items-center justify-center bg-white/80 text-gray-700 rounded-full hover:bg-white hover:text-red-600"
            type="button"
            onClick={() => setExpandedImage(null)}
          >
            <FontAwesomeIcon icon={faX} className="text-lg" />
          </button>

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
        <PriceSummary
          total={total}
          seatCost={seatCost}
          grandTotal={grandTotal}
          selectedTime={selectedTime}
          reservationEndDisplay={reservationEndDisplay}
        />
      </div>
      {errorMessage && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
