import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

function Modal() {
  return (
    <div className="absolute top-full right-0 mt-2 flex flex-col gap-2 bg-white shadow-md rounded p-4 z-50">
      <Link href="/profile" className="modal-hover">Profile</Link>
      <Link href="/settings" className="modal-hover">Settings</Link>
      <LogoutButton />
    </div>
  );
}
export default Modal;
