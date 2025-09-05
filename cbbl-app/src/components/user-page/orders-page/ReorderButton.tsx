"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ReorderButtonProps {
  orderId: string;
}

export default function ReorderButton({ orderId }: ReorderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const router = useRouter();

  // ✅ Check if user has an active order
  useEffect(() => {
    const checkActiveOrder = async () => {
      try {
        const res = await fetch("/api/orders/check");
        if (!res.ok) throw new Error("Failed to check active orders");
        const data = await res.json();
        setDisabled(data.hasPreOrder);
      } catch (err) {
        console.error(err);
      }
    };

    checkActiveOrder();
  }, []);

  const handleReorder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/reorder?orderId=${orderId}`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reorder");

      router.refresh();
      alert("Order added to cart!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReorder}
      disabled={loading || disabled}
      className={`button-style ${
        loading || disabled
          ? "opacity-50 cursor-not-allowed" // visually indicate disabled
          : "" // example hover style for active
      }`}
      title={disabled ? "You have an active order" : ""}
    >
      {loading ? "Adding..." : "Reorder"}
    </button>
  );
}
