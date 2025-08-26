import Products from "./productsmain-components/Products";
import ProductsHeader from "./productsmain-components/ProductsHeader";

function ProductsMain() {
    return(
        <main className="bg-[#3C604C]/10 w-full h-screen overflow-auto py-15 px-20 text-brown relative">
            <ProductsHeader />
            <Products />
        </main>
    );
}
export default ProductsMain;