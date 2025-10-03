"use client";

import Link from "next/link";
import Image from "next/image";
import Modal from "./header-components/Modal";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

function UserPageHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState<{
    name?: string;
    image?: string;
  } | null>(null);

  const { data: session } = useSession();

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  // Fetch the latest profile image from API
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, [session?.user?.email]); // refetch if the user changes

  const displayUser = userData || session?.user;

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
              <Link href="/home/seat" className="line-hover">
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
      <div className="relative w-10 h-10">
        {displayUser?.image ? (
          <Image
            src={displayUser.image}
            alt={displayUser.name || "User"}
            fill
            className="cursor-pointer object-cover rounded-full"
            sizes="40px"
            onClick={toggleModal}
          />
        ) : (
          <div
            onClick={toggleModal}
            className="w-10 h-10 rounded-full bg-[#3C604C] flex items-center justify-center text-white text-lg font-bold cursor-pointer"
          >
            {displayUser?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
        )}
        {isModalOpen && <Modal />}
      </div>
    </header>
  );
}

export default UserPageHeader;
