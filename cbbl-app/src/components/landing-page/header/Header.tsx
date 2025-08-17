"use client"

import Image from "next/image";
import SignInButton from "./header-components/SignInButton";
import SignIn from "../pop-up-signin/SignIn";
import { useEffect, useState } from "react";

function Header() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [showSignIn, setShowSignIn] = useState(false);

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
            <header className={`fixed top-0 left-0 w-full flex justify-between items-center py-2 px-4 bg-white shadow-md shadow-black/20 transition-transform duration-300 z-50 text-brown ${
            isVisible ? "translate-y-0" : "-translate-y-full"
            }`}>
                <a className="flex justify-center items-center gap-2" href="#">
                    <Image src="/cbbl-logo.svg" alt="Logo" width={50} height={50} />
                    <p className="font-semibold">Coffee Beats By Life</p>
                </a>
                <div className="flex justify-center items-center gap-4">
                    <nav className="flex justify-center items-center">
                        <ul className="flex justify-center items-center gap-10">
                            <li>
                                <a
                                className="line-hover"
                                href="#"
                                >
                                    Home
                                </a>
                            </li>
                            <li>
                                <a 
                                className="line-hover"
                                href="#menu"
                                >
                                    Menu
                                </a>
                            </li>
                            <li>
                                <a 
                                className="line-hover"
                                href="#about"
                                >
                                    About
                                </a>
                            </li>
                            <li>
                                <a 
                                className="line-hover"
                                href="#contact"
                                >
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </nav>
                    <SignInButton onClick={() => setShowSignIn(true)} />
                </div>
            </header>
            {showSignIn && <SignIn />}
        </>
    );
}
export default Header;