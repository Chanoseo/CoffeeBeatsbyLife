"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SectionTwoData = {
  landingSecTwoTitle?: string;
  landingSecTwoDesc?: string;
  landingSecTwoContent?: string;
  landingSecTwoImage?: string;
};

function SectionTwo() {
  const [data, setData] = useState<SectionTwoData>({
    landingSecTwoTitle: "Our Story",
    landingSecTwoDesc:
      "Where coffee meets rhythm, and every visit finds its flow.",
    landingSecTwoContent: `At Coffee Beats By Life, we believe coffee is more than a beverage—it’s a rhythm, a ritual, and a refuge.
Our journey began with a simple challenge: how do we preserve the serenity of a café while embracing the pulse of a growing community? As demand surged, so did the queues, the crowded tables, and the parking woes. We listened, we learned, and we responded—with a digital-first solution that blends hospitality with smart technology.
From real-time reservations and virtual queueing to pre-ordering and parking assistance, every feature of our platform is designed to make your visit smoother, smarter, and more enjoyable.
Every tap, every click, every feedback form is part of a bigger beat—one that keeps our café flowing effortlessly and our guests coming back for more.
Welcome to a place where life slows down, and every sip is a step in the journey.`,
    landingSecTwoImage: "/cbbl-logo.svg",
  });

  useEffect(() => {
    async function fetchSectionTwo() {
      try {
        const res = await fetch("/api/cms");
        if (!res.ok) throw new Error("Failed to fetch CMS data");
        const cmsData = await res.json();

        setData((prev) => ({
          landingSecTwoTitle:
            cmsData.landingSecTwoTitle || prev.landingSecTwoTitle,
          landingSecTwoDesc:
            cmsData.landingSecTwoDesc || prev.landingSecTwoDesc,
          landingSecTwoContent:
            cmsData.landingSecTwoContent || prev.landingSecTwoContent,
          landingSecTwoImage:
            cmsData.landingSecTwoImage || prev.landingSecTwoImage,
        }));
      } catch (err) {
        console.error(err);
      }
    }

    fetchSectionTwo();
  }, []);

  return (
    <section className="bg-white p-10 text-center text-brown" id="about">
      <div className="mb-10">
        <h1 className="md:text-5xl text-3xl font-bold mb-3">
          {data.landingSecTwoTitle}
        </h1>
        <p className="md:text-xl text-base">{data.landingSecTwoDesc}</p>
      </div>
      <div className="lg:flex-row flex flex-col-reverse justify-center items-center gap-4">
        {/* Content */}
        <div className="lg:w-2/5 lg:text-left w-full text-justify">
          {data.landingSecTwoContent &&
            data.landingSecTwoContent.split("\n").map((paragraph, i) => (
              <p key={i} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
        </div>

        {/* Image */}
        <Image
          src={data.landingSecTwoImage || "/cbbl-logo.svg"}
          alt={data.landingSecTwoTitle || "Section Two Image"}
          width={400}
          height={400}
          className="md:w-100 md:h-100 w-60 h-60"
        />
      </div>
    </section>
  );
}

export default SectionTwo;
