import ResetPasswordPage from "@/components/landing-page/reset-password/ResetPassword";
import { Suspense } from "react";

export const metadata = {
  title: "Reset Password",
  description: "Reset your password for Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

export default function Page() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ResetPasswordPage />
    </Suspense>
  );
}
