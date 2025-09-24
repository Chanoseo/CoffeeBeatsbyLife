import AdminCMSPage from "@/components/admin-page/AdminCMSPage";

export const metadata = {
  title: "CMS",
  description:
    "Easily customize and manage the content of your coffee shop landing page with the Coffee Beats By Life Dashboard. Update images, text, and sections in real-time.",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function CMSPage() {
  return <AdminCMSPage />;
}
export default CMSPage;
