import Orders from "./ordersmain-components/Orders";
import OrdersHeader from "./ordersmain-components/OrdersHeader";

function OrdersMain() {
    return(
        <main className="bg-[#3C604C]/10 w-full h-screen overflow-auto py-15 px-20 text-brown">
            <OrdersHeader />
            <Orders />
        </main>
    );
}
export default OrdersMain;