import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import Seat from "@/components/user-page/seat-page/Seat";

export const metadata = {
  title: "Seat",
  description:
    "View available, reserved, and occupied seats at Coffee Beats By Life.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function UserHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <UserPageHeader />

      {/* Main content */}
      <div className="flex-grow">
        <Seat />
      </div>

      {/* Footer */}
      <UserPageFooter />
    </div>
  );
}
