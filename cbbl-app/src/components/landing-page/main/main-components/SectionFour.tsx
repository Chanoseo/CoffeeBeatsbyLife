"use client";

import Form from "./Form";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLocationDot,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

type SectionFourData = {
  landingSecFourTitle?: string;
  landingSecFourDesc?: string;
  landingSecFourLocation?: string;
  landingSecFourPhoneNum?: string;
  landingSecFourEmail?: string;
};

function SectionFour() {
  const [cmsData, setCmsData] = useState<SectionFourData>({
    landingSecFourTitle: "Visit Us",
    landingSecFourDesc:
      "Reserve, relax, and arrive—coffee’s ready when you are.",
    landingSecFourLocation: "Santo Tomas, Batangas, Philippines",
    landingSecFourPhoneNum: "+63 917 167 0831",
    landingSecFourEmail: "coffeebeatsbylife@gmail.com",
  });

  useEffect(() => {
    async function fetchCMS() {
      try {
        const res = await fetch("/api/cms");
        const data = await res.json();
        setCmsData((prev) => ({
          landingSecFourTitle:
            data.landingSecFourTitle || prev.landingSecFourTitle,
          landingSecFourDesc:
            data.landingSecFourDesc || prev.landingSecFourDesc,
          landingSecFourLocation:
            data.landingSecFourLocation || prev.landingSecFourLocation,
          landingSecFourPhoneNum:
            data.landingSecFourPhoneNum || prev.landingSecFourPhoneNum,
          landingSecFourEmail:
            data.landingSecFourEmail || prev.landingSecFourEmail,
        }));
      } catch (err) {
        console.error("Failed to fetch CMS for SectionFour:", err);
      }
    }

    fetchCMS();
  }, []);

  return (
    <section
      className="lg:px-30 bg-white py-10 px-5 flex flex-col items-center justify-center text-brown"
      id="contact"
    >
      <div className="mb-10 text-center">
        <h1 className="md:text-5xl text-3xl font-bold mb-3">
          {cmsData.landingSecFourTitle}
        </h1>
        <p className="md:text-xl text-base">{cmsData.landingSecFourDesc}</p>
      </div>

      <div className="md:flex-row md:gap-0 w-full flex flex-col gap-10 justify-center items-center">
        <div className="w-full flex flex-col justify-center items-center">
          <FontAwesomeIcon
            icon={faLocationDot}
            className="md:text-6xl lg:text-7xl text-5xl text-[#3C604C]"
          />
          <h1 className="md:text-xl mt-2 text-lg font-bold">Our Location</h1>
          <p className="lg:text-base mt-5 text-sm">
            {cmsData.landingSecFourLocation}
          </p>
        </div>

        <div className="w-full flex flex-col justify-center items-center">
          <FontAwesomeIcon
            icon={faPhone}
            className="md:text-6xl lg:text-7xl text-5xl text-[#3C604C]"
          />
          <h1 className="md:text-xl mt-2 text-lg font-bold">Call Us</h1>
          <p className="lg:text-base mt-5 text-sm">
            {cmsData.landingSecFourPhoneNum}
          </p>
        </div>

        <div className="w-full flex flex-col justify-center items-center">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="md:text-6xl lg:text-7xl text-5xl text-[#3C604C]"
          />
          <h1 className="md:text-xl mt-2 text-lg font-bold">Email Us</h1>
          <p className="lg:text-base mt-5 text-sm">
            {cmsData.landingSecFourEmail}
          </p>
        </div>
      </div>

      <Form />
    </section>
  );
}

export default SectionFour;
