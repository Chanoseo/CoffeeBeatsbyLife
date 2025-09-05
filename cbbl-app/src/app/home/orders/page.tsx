import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import OrdersPageMain from "@/components/user-page/orders-page/Main";

function OrdersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <UserPageHeader />

      {/* Main content grows to fill available space */}
      <main className="flex-grow">
        <OrdersPageMain />
      </main>

      {/* Footer always at bottom */}
      <UserPageFooter />
    </div>
  );
}

export default OrdersPage;
