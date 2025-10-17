"use client";

import Link from "next/link";
import Image from "next/image";
import Modal from "./header-components/Modal";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBars,
  faX,
} from "@fortawesome/free-solid-svg-icons";

function UserPageHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userData, setUserData] = useState<{
    name?: string;
    image?: string;
  } | null>(null);

  const { data: session } = useSession();

  const toggleModal = () => setIsModalOpen((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

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
  }, [session?.user?.email]);

  const displayUser = userData || session?.user;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="w-full bg-white text-brown shadow-sm shadow-black/20 z-50 px-4 md:px-8 py-3 flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/home" className="flex items-center">
          <Image src="/cbbl-logo.svg" alt="Logo" width={50} height={50} />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-10 items-center">
          <Link href="/home" className="line-hover">
            Menu
          </Link>
          <Link href="/home/seat" className="line-hover">
            Seat
          </Link>
          <Link href="/home/orders" className="line-hover">
            Orders
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleMenu}
            className="text-2xl focus:outline-none hover:text-[#3C604C] transition-colors"
          >
            <FontAwesomeIcon icon={isMenuOpen ? faX : faBars} />
          </button>
        </div>

        {/* User Avatar */}
        <div className="relative ml-4 w-10 h-10 hidden md:block">
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

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end text-brown">
          <div className="w-3/4 max-w-xs bg-white h-full shadow-lg flex flex-col p-6 gap-6 animate-slide-left">
            <button className="self-end text-2xl" onClick={toggleMenu}>
              <FontAwesomeIcon icon={faX} />
            </button>
            <div className="flex flex-col gap-6 flex-grow">
              <Link href="/home" className="line-hover" onClick={toggleMenu}>
                Menu
              </Link>
              <Link
                href="/home/seat"
                className="line-hover"
                onClick={toggleMenu}
              >
                Seat
              </Link>
              <Link
                href="/home/orders"
                className="line-hover"
                onClick={toggleMenu}
              >
                Orders
              </Link>
            </div>

            <Link
              href="#"
              className="flex gap-2 items-center bg-red-500 p-2 rounded text-white"
              onClick={handleSignOut}
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              <span>Sign Out</span>
            </Link>
            {/* Profile Avatar in Mobile Menu */}
            <Link
              href="/profile"
              className="flex items-center cursor-pointer"
              onClick={() => setIsMenuOpen(false)} // close menu when navigating
            >
              {displayUser?.image ? (
                <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-full">
                  <Image
                    src={displayUser.image}
                    alt={displayUser.name || "User"}
                    fill
                    sizes="40px"
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#3C604C] flex items-center justify-center text-white text-lg font-bold">
                  {displayUser?.name?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
              <div className="flex flex-col ml-2">
                <span className="text-xs lg:text-sm">
                  {displayUser?.name ?? "User"}
                </span>
                <span className="text-xs lg:text-sm capitalize">Profile</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default UserPageHeader;
