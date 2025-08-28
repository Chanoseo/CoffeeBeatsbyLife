"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";

function DashboardHeader() {
  const { data: session } = useSession();

  const fullName = session?.user?.name || "Guest User";

  return (
    <section className="flex justify-between items-center bg-white shadow-sm rounded-xl p-6 flex-1">
      <h2 className="md:text-2xl text-lg font-semibold">Dashboard</h2>
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
        <span className="lg:block text-sm hidden">{fullName}</span>
      </div>
    </section>
  );
}

export default DashboardHeader;
