import { Suspense } from "react";
import OrderDetails from "@/components/admin-page/main/ordersmain/OrderDetails";

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<p className="text-center mt-6 text-gray-500">Loading order details...</p>}>
      <OrderDetails />
    </Suspense>
  );
}
