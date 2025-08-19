import ForgotPassword from "@/components/landing-page/forgot-password/ForgotPassword";

export const metadata = {
  title: "Forgot Password",
  description: "Reset your password for Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function Page() {
  return (
    <>
      <ForgotPassword />
    </>
  );
}
