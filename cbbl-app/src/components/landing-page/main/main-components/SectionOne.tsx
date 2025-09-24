"use client";

import Image from "next/image";
import ButtonOne from "./ButtonOne";
import { useState, useEffect } from "react";
import SignIn from "../../pop-up-signin/SignIn";

type SectionOneData = {
  landingSecOneTitle?: string;
  landingSecOneDesc?: string;
  landingSecOneButtonText?: string;
  landingSecOneImage?: string;
};

function SectionOne() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [data, setData] = useState<SectionOneData>({
    landingSecOneTitle: "Coffee Beats By Life",
    landingSecOneDesc: "Brewed with passion, served with purpose.",
    landingSecOneButtonText: "Reserve Your Seat & Order Now",
    landingSecOneImage: "/cbbl-image.jpg",
  });

  // Fetch CMS data
  useEffect(() => {
    async function fetchSectionOne() {
      try {
        const res = await fetch("/api/cms");
        if (!res.ok) throw new Error("Failed to fetch CMS data");
        const cmsData = await res.json();

        setData((prev) => ({
          landingSecOneTitle:
            cmsData.landingSecOneTitle || prev.landingSecOneTitle,
          landingSecOneDesc:
            cmsData.landingSecOneDesc || prev.landingSecOneDesc,
          landingSecOneButtonText:
            cmsData.landingSecOneButtonText || prev.landingSecOneButtonText,
          landingSecOneImage:
            cmsData.landingSecOneImage || prev.landingSecOneImage,
        }));
      } catch (err) {
        console.error(err);
      }
    }

    fetchSectionOne();
  }, []);

  return (
    <section className="lg:h-[75vh] h-[80vh] relative shadow-md shadow-black/20">
      <div className="absolute inset-0">
        {/* Background Image */}
        <Image
          src={data.landingSecOneImage!}
          alt="Coffee Beats By Life"
          width={1500}
          height={100}
          className="h-full w-full object-cover absolute inset-0 -z-50 pointer-events-none"
          priority
        />
        {/* Overlay */}
        <div className="xl:bg-gradient-to-r xl:from-black/20 xl:to-[#3C604C]/40 absolute inset-0 bg-black/70 -z-40"></div>
        {/* Content */}
        <div className="md:p-20 xl:text-start xl:w-2/4 h-full w-full flex flex-col justify-center p-5 text-white mt-5 text-center">
          <h1 className="md:text-5xl text-3xl font-bold mb-4">
            {data.landingSecOneTitle}
          </h1>
          <p className="md:text-lg text-md mb-8">{data.landingSecOneDesc}</p>
          <div>
            <ButtonOne onClick={() => setShowSignIn(true)}>
              {data.landingSecOneButtonText}
            </ButtonOne>
          </div>
        </div>
      </div>
      {showSignIn && <SignIn />}
    </section>
  );
}

export default SectionOne;
