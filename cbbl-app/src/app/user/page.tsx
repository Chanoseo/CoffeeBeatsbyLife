import AdminAddUserPage from "@/components/admin-page/AdminUserPage";

export const metadata = {
  title: "User",
  description:
    "Manage system users: add new users, edit existing user details, assign roles, and monitor user accounts.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function UserPage() {
  return <AdminAddUserPage />;
}
export default UserPage;
