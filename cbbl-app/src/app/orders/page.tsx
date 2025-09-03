import AdminOrdersPage from "@/components/admin-page/OrdersPage";

export const metadata = {
  title: "Orders",
  description: "View and manage all coffee shop orders efficiently with Coffee Beats By Life Dashboard. Track order details, statuses, and improve service in one platform.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function OrdersPage() {
  return <AdminOrdersPage />;
}
export default OrdersPage;
