import Messages from "./messagesmain-components/Messages";
import MessagesHeader from "./messagesmain-components/MessagesHeader";

function MessagesMain() {
  return (
    <main className="bg-[#3C604C]/10 w-full h-screen overflow-auto py-15 px-20 text-brown">
      <MessagesHeader />
      <Messages />
    </main>
  );
}
export default MessagesMain;
