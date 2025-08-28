"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBagShopping,
  faClipboardList,
  faEnvelope,
  faGauge,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Navigation() {
  const pathname = usePathname();
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: faGauge },
    { href: "/products", label: "Products", icon: faBagShopping },
    { href: "/orders", label: "Orders", icon: faClipboardList },
    { href: "/messages", label: "Messages", icon: faEnvelope },
    { href: "/customers", label: "Customers", icon: faUsers },
  ];

  return (
    <aside className="lg:p-10 lg:w-90 w-fit px-2 py-10 h-screen shadow-sm z-50 flex flex-col text-brown text-lg">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-15">
        <Image src="/cbbl-logo.svg" alt="Logo" width={50} height={50} />
        <h1 className="lg:block xl:text-2xl hidden text-xl font-semibold">Coffee Beats</h1>
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
                  className={`admin-nav-btn-style xl:text-xl text-base ${
                    isActive ? "bg-[#3C604C] text-white" : ""
                  }`}
                >
                  <FontAwesomeIcon icon={link.icon} />
                  <span className="lg:block hidden">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout button at the bottom */}
      <button className="admin-nav-btn-style" onClick={() => signOut()}>
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
        <span className="lg:block hidden">Sign Out</span>
      </button>
    </aside>
  );
}
export default Navigation;
