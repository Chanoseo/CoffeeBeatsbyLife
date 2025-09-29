import { Suspense } from "react";
import OrderDetails from "@/components/admin-page/main/ordersmain/OrderDetails";

export const metadata = {
  title: "Order Details",
  description: "Easily view and track your orders at Coffee Beats By Life.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<p className="text-center mt-6 text-gray-500">Loading order details...</p>}>
      <OrderDetails />
    </Suspense>
  );
}
