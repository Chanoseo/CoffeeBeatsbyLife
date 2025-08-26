import OrdersMain from "@/components/admin-page/main/ordersmain/OrdersMain";
import Navigation from "@/components/admin-page/navigation/Navigation";

export const metadata = {
  title: "Orders",
  description: "View and manage all coffee shop orders efficiently with Coffee Beats By Life Dashboard. Track order details, statuses, and improve service in one platform.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function AdminOrdersPage() {
  return (
      <div className="flex">
        <Navigation />
        <OrdersMain />
      </div>
  );
}
export default AdminOrdersPage;
