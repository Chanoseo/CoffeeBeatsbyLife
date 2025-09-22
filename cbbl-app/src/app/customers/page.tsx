import AdminCustomersPage from "@/components/admin-page/AdminCustomersPage";

export const metadata = {
  title: "Customers",
  description:
    "Notify and manage your customers effectively in Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function CustomersPage() {
  return <AdminCustomersPage />;
}
export default CustomersPage;
