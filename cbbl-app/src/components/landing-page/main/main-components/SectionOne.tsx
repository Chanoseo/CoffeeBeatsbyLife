"use client"

import Image from "next/image";
import ButtonOne from "./ButtonOne";
import { useState } from "react";
import SignIn from "../../pop-up-signin/SignIn";

function SectionOne() {
    const [showSignIn, setShowSignIn] = useState(false);

    return (
        <section className="lg:h-[75vh] h-[80vh] relative shadow-md shadow-black/20">
            <div className="absolute inset-0">
                {/* Background Image */}
                <Image
                    src="/cbbl-image.jpg"
                    alt="Coffee Beats By Life"
                    width={1500}
                    height={100}
                    className="h-full w-full object-cover absolute inset-0 -z-50 pointer-events-none"
                    priority
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-[#3C604C]/70 -z-40"></div>
                {/* Content */}
                <div className="md:p-20 xl:text-start xl:w-2/4 h-full w-full flex flex-col justify-center p-5 text-white mt-5 text-center">
                    <h1 className="md:text-5xl text-3xl font-bold mb-4">Coffee Beats By Life</h1>
                    <p className="md:text-lg text-md mb-8">Brewed with passion, served with purpose.</p>
                    <div>
                        <ButtonOne onClick={() => setShowSignIn(true)}/>
                    </div>
                </div>
            </div>
            {showSignIn && <SignIn />}
        </section>
    );
}
export default SectionOne;