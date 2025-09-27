"use client";

import Link from "next/link";
import Image from "next/image";
import Modal from "./header-components/Modal";
import { useState } from "react";
import { useSession } from "next-auth/react";

function UserPageHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <header className="flex justify-between items-center py-2 px-4 bg-white text-brown shadow-sm shadow-black/20 z-50">
      <Image src="/cbbl-logo.svg" alt="Logo" width={50} height={50} />
      <div className="flex items-center justify-between gap-4">
        <nav>
          <ul className="flex gap-10">
            <li>
              <Link href="/home" className="line-hover">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/seat" className="line-hover">
                Seat
              </Link>
            </li>
            <li>
              <Link href="/home/orders" className="line-hover">
                Orders
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="relative w-10 h-10 rounded-full">
        <Image
          src={session?.user?.image || "/profile-default.png"}
          alt={session?.user?.name || "User"}
          fill
          className="cursor-pointer object-cover rounded-full"
          sizes="40px"
          onClick={toggleModal}
        />
        {isModalOpen && <Modal />}
      </div>
    </header>
  );
}

export default UserPageHeader;
