"use client";

import Image from "next/image";
import SignInButton from "./header-components/SignInButton";
import SignIn from "../pop-up-signin/SignIn";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

function Header() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lastScroll, setLastScroll] = useState(0);
  const [hidden, setHidden] = useState(false);

  // 🚀 Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
  }, [isMenuOpen]);

  // 🚀 Hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current > lastScroll && current > 60) {
        setHidden(true); // scrolling down
      } else {
        setHidden(false); // scrolling up
      }
      setLastScroll(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full flex justify-between items-center px-6 py-3
        bg-white border-b border-gray-200 shadow-md z-50 text-gray-800
        transition-transform duration-300 ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        {/* Logo */}
        <a className="flex items-center gap-2" href="#">
          <Image src="/cbbl-logo.svg" alt="Logo" width={45} height={45} />
          <p className="lg:block hidden font-semibold text-lg tracking-wide">
            Coffee Beats By Life
          </p>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <nav>
            <ul className="flex items-center gap-8 text-[15px] font-medium">
              {[
                { name: "Home", href: "#" },
                { name: "Menu", href: "#menu" },
                { name: "About", href: "#about" },
                { name: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    className="relative after:content-[''] after:block after:w-0 after:h-[2px] after:bg-brown
                    after:transition-all after:duration-300 hover:after:w-full hover:text-brown"
                    href={link.href}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <SignInButton onClick={() => setShowSignIn(true)} />
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button
          className="lg:hidden text-2xl p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
        </button>
      </header>

      {/* ✅ Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-white shadow-md z-40 lg:hidden
    transition-transform duration-500 ease-in-out
    ${isMenuOpen ? "translate-y-0" : "-translate-y-full"}`}
        style={{ pointerEvents: isMenuOpen ? "auto" : "none" }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-10 text-lg font-medium">
          <nav>
            <ul className="flex flex-col items-center gap-8">
              {[
                { name: "Home", href: "#" },
                { name: "Menu", href: "#menu" },
                { name: "About", href: "#about" },
                { name: "Contact", href: "#contact" },
              ].map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-brown transition-colors text-xl"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <SignInButton
            onClick={() => {
              setShowSignIn(true);
              setIsMenuOpen(false);
            }}
          />
        </div>
      </div>

      {showSignIn && <SignIn />}
    </>
  );
}

export default Header;
