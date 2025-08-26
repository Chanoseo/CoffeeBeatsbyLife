import ProductsMain from "@/components/admin-page/main/productsmain/ProductsMain";
import Navigation from "@/components/admin-page/navigation/Navigation";

export const metadata = {
  title: "Products",
  description: "Manage your products, update details, set prices, and organize categories with ease.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function AdminProductsPage() {
  return (
    <div className="flex">
      <Navigation />
      <ProductsMain />
    </div>
  );
}
export default AdminProductsPage;
