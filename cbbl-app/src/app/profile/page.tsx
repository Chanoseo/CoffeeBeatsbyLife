import UserProfilePage from "@/components/user-page/profile-page/UserProfilePage";

export const metadata = {
  title: "Profile",
  description: "Manage and update your Coffee Beats By Life account profile.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function ProfilePage() {
  return <UserProfilePage />;
}
