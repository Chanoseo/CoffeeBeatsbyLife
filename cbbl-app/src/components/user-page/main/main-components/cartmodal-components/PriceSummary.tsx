"use client";

interface PriceSummaryProps {
  total: number;
  seatCost: number;
  grandTotal: number;
  selectedTime: string | null;
  reservationEndDisplay: Date | null;
}

export default function PriceSummary({
  total,
  seatCost,
  grandTotal,
  selectedTime,
  reservationEndDisplay,
}: PriceSummaryProps) {
  return (
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
  );
}
