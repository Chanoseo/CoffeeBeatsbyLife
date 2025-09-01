"use client";

import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBagShopping,
  faBars,
  faClipboardList,
  faEnvelope,
  faGauge,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationProps {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleMobile?: () => void;
}

function Navigation({ collapsed, mobileOpen, toggleMobile }: NavigationProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const fullName = session?.user?.name || "Guest User";
  const nameParts = fullName.split(" ");
  const displayName =
    nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}`
      : fullName;

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: faGauge },
    { href: "/products", label: "Products", icon: faBagShopping },
    { href: "/orders", label: "Orders", icon: faClipboardList },
    { href: "/messages", label: "Messages", icon: faEnvelope },
    { href: "/customers", label: "Customers", icon: faUsers },
  ];

  return (
    <aside
      className={`
        h-screen flex flex-col text-white bg-[#3C604C] z-50
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-fit items-center" : "md:w-74"} px-4 py-10 overflow-hidden
        fixed top-0 left-0 sm:relative
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"} 
        sm:translate-x-0 sm:flex w-fit
      `}
    >
      {/* Mobile close button */}
      <div className="sm:hidden flex justify-end mb-4">
        {toggleMobile && (
          <FontAwesomeIcon icon={faBars} onClick={toggleMobile} className="text-white text-2xl"/>
        )}
      </div>

      {/* Logo */}
      <div
        className={`flex items-center gap-2 mb-15 py-2 px-4 ${
          collapsed ? "justify-center" : "justify-start"
        }`}
      >
        <div className="relative w-[40px] h-[40px] flex-shrink-0">
          <Image
            src="/cbbl-logo.svg"
            alt="Logo"
            fill
            className="object-contain brightness-0 invert"
          />
        </div>
        {!collapsed && <h1 className="text-2xl font-semibold">CBBL</h1>}
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`admin-navbar ${
                    isActive ? "bg-white text-[#3C604C]" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} />
                  {!collapsed && <span>{link.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <button
        className="admin-navbar"
        onClick={() => signOut()}
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        {!collapsed && <span>Sign Out</span>}
      </button>

      {/* Avatar */}
      <div
        className={`flex items-center mt-8 px-4 ${
          collapsed ? "justify-center" : "justify-start"
        }`}
      >
        <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-full">
          <Image
            src={session?.user?.image || "/cbbl-image.jpg"}
            alt="User Image"
            fill
            sizes="40px"
            className="object-cover rounded-full"
          />
        </div>

        {/* Only show name when not collapsed */}
        {!collapsed && (
          <div className="flex flex-col ml-2">
            <span className="text-nowrap text-xs lg:text-sm">{displayName}</span>
            <span className="text-nowrap text-xs lg:text-sm">Administrator</span>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Navigation;
