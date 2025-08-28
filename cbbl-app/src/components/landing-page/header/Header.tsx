"use client";

import Image from "next/image";
import SignInButton from "./header-components/SignInButton";
import SignIn from "../pop-up-signin/SignIn";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

function Header() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showSignIn, setShowSignIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > lastScrollY) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollY(window.scrollY);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    return (
        <>
            <header
                className={`fixed top-0 left-0 w-full flex justify-between items-center py-2 px-4 bg-white shadow-md shadow-black/20 transition-transform duration-300 z-50 text-brown ${
                    isVisible ? "translate-y-0" : "-translate-y-full"
                }`}
            >
                {/* Logo */}
                <a className="flex justify-center items-center gap-2" href="#">
                    <Image src="/cbbl-logo.svg" alt="Logo" width={50} height={50} />
                    <p className="lg:block hidden font-semibold">Coffee Beats By Life</p>
                </a>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex justify-center items-center gap-4">
                    <nav>
                        <ul className="flex justify-center items-center gap-10">
                            <li><a className="line-hover" href="#">Home</a></li>
                            <li><a className="line-hover" href="#menu">Menu</a></li>
                            <li><a className="line-hover" href="#about">About</a></li>
                            <li><a className="line-hover" href="#contact">Contact</a></li>
                        </ul>
                    </nav>
                    <SignInButton onClick={() => setShowSignIn(true)} />
                </div>

                {/* Hamburger Menu Button (Mobile) */}
                <button
                    className="lg:hidden text-2xl"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
                </button>
            </header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-white flex flex-col items-center justify-center gap-8 z-40 lg:hidden">
                    <nav>
                        <ul className="flex flex-col items-center gap-8 text-lg">
                            <li><a href="#" onClick={() => setIsMenuOpen(false)}>Home</a></li>
                            <li><a href="#menu" onClick={() => setIsMenuOpen(false)}>Menu</a></li>
                            <li><a href="#about" onClick={() => setIsMenuOpen(false)}>About</a></li>
                            <li><a href="#contact" onClick={() => setIsMenuOpen(false)}>Contact</a></li>
                        </ul>
                    </nav>
                    <SignInButton onClick={() => { setShowSignIn(true); setIsMenuOpen(false); }} />
                </div>
            )}

            {showSignIn && <SignIn />}
        </>
    );
}

export default Header;
