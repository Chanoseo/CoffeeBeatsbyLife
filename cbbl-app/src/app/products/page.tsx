import AdminProductsPage from "@/components/admin-page/ProductsPage";

export const metadata = {
  title: "Products",
  description:
    "Manage your products, update details, set prices, and organize categories with ease.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function ProductsPage() {
  return <AdminProductsPage />;
}
