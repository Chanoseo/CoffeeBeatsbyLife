import MessagesMain from "@/components/admin-page/main/messagesmain/MessagesMain";
import Navigation from "@/components/admin-page/navigation/Navigation";

function AdminMessagesPage() {
  return (
    <div className="flex">
      <Navigation />
      <MessagesMain />
    </div>
  );
}
export default AdminMessagesPage;
