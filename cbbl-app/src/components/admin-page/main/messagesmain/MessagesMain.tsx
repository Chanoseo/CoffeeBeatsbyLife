import Messages from "./messagesmain-components/Messages";
import MessagesHeader from "./messagesmain-components/MessagesHeader";

interface MessagesMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function MessagesMain({ toggleNav }: MessagesMainProps) {
  return (
    <main className="w-full h-screen overflow-auto text-brown">
      <MessagesHeader toggleNav={toggleNav}/>
      <Messages />
    </main>
  );
}
export default MessagesMain;
