import MessagesMain from "@/components/admin-page/main/messagesmain/MessagesMain";
import Navigation from "@/components/admin-page/navigation/Navigation";

export const metadata = {
  title: "Messages",
  description: "View and manage your received messages in Coffee Beats By Life",
  icons: {
    icon: "/cbbl-logo.svg",
    shortcut: "/cbbl-logo.svg",
    apple: "/cbbl-logo.svg",
  },
};

function AdminMessagesPage() {
  return (
    <div className="flex">
      <Navigation />
      <MessagesMain />
    </div>
  );
}
export default AdminMessagesPage;
