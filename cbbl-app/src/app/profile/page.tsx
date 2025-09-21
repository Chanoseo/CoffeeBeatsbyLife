import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import Profile from "@/components/user-page/profile-page/Profile";

export const metadata = {
  title: "Profile",
  description: "Manage and update your Coffee Beats By Life account profile.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function UserProfilePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <UserPageHeader />

      {/* Main content */}
      <main className="flex-grow py-10 px-40">
        <Profile />
      </main>

      {/* Footer */}
      <UserPageFooter />
    </div>
  );
}
