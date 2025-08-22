import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import OrdersPageMain from "@/components/user-page/orders-page/Main";

function OrdersPage() {
    return (
        <>
            <UserPageHeader />
            <OrdersPageMain />
            <UserPageFooter />
        </>
    );
}
export default OrdersPage;