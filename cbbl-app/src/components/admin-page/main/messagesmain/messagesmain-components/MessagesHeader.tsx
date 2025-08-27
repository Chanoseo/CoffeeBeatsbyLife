"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

function MessagesHeader() {
  const { data: session } = useSession();

  const fullName = session?.user?.name || "Guest User";

  return (
    <section className="flex justify-between items-center bg-white shadow-sm rounded-xl p-6 flex-1">
      <h2 className="text-2xl font-semibold">Messages</h2>
      <div className="flex gap-4 items-center">
        <div className="relative w-10 h-10 rounded-full">
          <Image
            src={session?.user?.image || "/cbbl-image.jpg"}
            alt="User Image"
            fill
            sizes="50px"
            className="object-cover rounded-full"
          />
        </div>
        <span className="text-sm">{fullName}</span>
      </div>
    </section>
  );
}

export default MessagesHeader;
