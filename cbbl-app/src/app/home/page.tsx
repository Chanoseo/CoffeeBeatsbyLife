import UserPageFooter from "@/components/user-page/footer/Footer";
import UserPageHeader from "@/components/user-page/header/Header";
import UserPageMain from "@/components/user-page/main/Main";

export const metadata = {
  title: "Home",
  description: "Welcome to Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function UserHomePage() {
  return (
    <>
      <UserPageHeader />
      <UserPageMain />
      <UserPageFooter />
    </>
  );
}
