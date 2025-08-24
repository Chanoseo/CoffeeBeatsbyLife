import DashboardMain from "@/components/admin-page/main/dashboardmain/DashboardMain";
import Navigation from "@/components/admin-page/navigation/Navigation";

export const metadata = {
  title: "Dashboard",
  description: "Coffee Beats By Life Dashboard - Manage reservations, track orders, monitor customers, and streamline your coffee shop operations in one place.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function AdminDashboardPage() {
  return (
    <div className="flex">
      <Navigation />
      <DashboardMain />
    </div>
  );
}
