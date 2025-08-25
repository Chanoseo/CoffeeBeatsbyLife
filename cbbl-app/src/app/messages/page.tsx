import MessagesMain from "@/components/admin-page/main/messagesmain/MessagesMain";
import Navigation from "@/components/admin-page/navigation/Navigation";

function Messages() {
  return (
    <div className="flex">
      <Navigation />
      <MessagesMain />
    </div>
  );
}
export default Messages;
