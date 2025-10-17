import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import OrdersPageMain from "@/components/user-page/orders-page/Main";

export const metadata = {
  title: "Orders",
  description: "View your active and past orders in Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function OrdersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <UserPageHeader />

      {/* Main content grows to fill available space */}
      <main className="flex-grow bg-white">
        <OrdersPageMain />
      </main>

      {/* Footer always at bottom */}
      <UserPageFooter />
    </div>
  );
}

export default OrdersPage;
