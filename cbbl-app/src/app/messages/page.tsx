import AdminMessagesPage from "@/components/admin-page/AdminMessagesPage";

export const metadata = {
  title: "Messages",
  description: "View and manage your received messages in Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function MessagesPage() {
  return (
    <AdminMessagesPage />
  );
}
export default MessagesPage;
