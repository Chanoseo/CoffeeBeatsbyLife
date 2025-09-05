import AdminSeatsPage from "@/components/admin-page/main/seatsmain/seatsmain-components/SeatsPage";

export const metadata = {
  title: "Seats",
  description: "View and manage all coffee shop orders efficiently with Coffee Beats By Life Dashboard. Track order details, statuses, and improve service in one platform.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function SeatsPage() {
  return <AdminSeatsPage />;
}
export default SeatsPage;
