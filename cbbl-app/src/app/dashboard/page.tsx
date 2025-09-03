import AdminDashboardPage from "@/components/admin-page/DashboardPage";

export const metadata = {
  title: "Dashboard",
  description:
    "Coffee Beats By Life Dashboard - Manage reservations, track orders, monitor customers, and streamline your coffee shop operations in one place.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function DashboardPage() {
  return <AdminDashboardPage />;
}
