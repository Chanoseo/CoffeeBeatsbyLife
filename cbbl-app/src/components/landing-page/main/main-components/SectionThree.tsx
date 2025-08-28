"use client"

import Image from "next/image";
import OrderNowButton from "./OrderNow";
import ViewMenuButton from "./ViewButton";
import SignIn from "../../pop-up-signin/SignIn";
import { useState } from "react";

function SectionThree() {
    const [showSignIn, setShowSignIn] = useState(false);

    return (
        <section className="md:px-30 bg-[#E4E0D6]/20 py-10 px-5 text-center text-brown" id="menu">
            <div className="mb-10">
                <h1 className="md:text-5xl text-3xl font-bold mb-3">Signature Offerings</h1>
                <p className="md:text-xl text-base">Every brew, every beat—made to move you.</p>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,auto))] gap-5 justify-center">
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-64 h-auto flex flex-col">
                    <Image
                    src="/cbbl-image.jpg"
                    alt="A beautiful scenery"
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col gap-4 text-left">
                        <div>
                            <h1 className="md:text-xl text-lg font-bold">Hazelnut Brew</h1>
                            <p className="md:text-sm text-xs mt-1">A smooth, aromatic blend infused with roasted hazelnuts and a hint of vanilla. Perfect for cozy mornings or a midday pick-me-up. Crafted from 100% Arabica beans and slow-brewed for a rich, nutty finish.</p>
                            <p className="md:text-2xl mt-2 underline text-xl">₱ 12.24</p>
                        </div>
                        <OrderNowButton onClick={() => setShowSignIn(true)} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-64 h-auto flex flex-col">
                    <Image
                    src="/cbbl-image.jpg"
                    alt="A beautiful scenery"
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col gap-4 text-left">
                        <div>
                            <h1 className="md:text-xl text-lg font-bold">Hazelnut Brew</h1>
                            <p className="md:text-sm text-xs mt-1">A smooth, aromatic blend infused with roasted hazelnuts and a hint of vanilla. Perfect for cozy mornings or a midday pick-me-up. Crafted from 100% Arabica beans and slow-brewed for a rich, nutty finish.</p>
                            <p className="md:text-2xl mt-2 underline text-xl">₱ 12.24</p>
                        </div>
                        <OrderNowButton onClick={() => setShowSignIn(true)} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-64 h-auto flex flex-col">
                    <Image
                    src="/cbbl-image.jpg"
                    alt="A beautiful scenery"
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col gap-4 text-left">
                        <div>
                            <h1 className="md:text-xl text-lg font-bold">Hazelnut Brew</h1>
                            <p className="md:text-sm text-xs mt-1">A smooth, aromatic blend infused with roasted hazelnuts and a hint of vanilla. Perfect for cozy mornings or a midday pick-me-up. Crafted from 100% Arabica beans and slow-brewed for a rich, nutty finish.</p>
                            <p className="md:text-2xl mt-2 underline text-xl">₱ 12.24</p>
                        </div>
                        <OrderNowButton onClick={() => setShowSignIn(true)} />
                    </div>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-64 h-auto flex flex-col">
                    <Image
                    src="/cbbl-image.jpg"
                    alt="A beautiful scenery"
                    width={300}
                    height={300}
                    className="w-full h-48 object-cover"
                    />
                    <div className="p-4 flex flex-col gap-4 text-left">
                        <div>
                            <h1 className="md:text-xl text-lg font-bold">Hazelnut Brew</h1>
                            <p className="md:text-sm text-xs mt-1">A smooth, aromatic blend infused with roasted hazelnuts and a hint of vanilla. Perfect for cozy mornings or a midday pick-me-up. Crafted from 100% Arabica beans and slow-brewed for a rich, nutty finish.</p>
                            <p className="md:text-2xl mt-2 underline text-xl">₱ 12.24</p>
                        </div>
                        <OrderNowButton onClick={() => setShowSignIn(true)} />
                    </div>
                </div>
            </div>
            <ViewMenuButton onClick={() => setShowSignIn(true)}/>
            {showSignIn && <SignIn />}
        </section>
    )
}
export default SectionThree;