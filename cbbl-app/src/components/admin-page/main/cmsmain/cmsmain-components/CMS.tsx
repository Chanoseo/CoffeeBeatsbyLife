"use client";

import { useEffect, useState } from "react";
import CMSForm from "./CMSForm";
import Preview from "./Preview";

function CMS() {
  // Section One state
  const [sectionOne, setSectionOne] = useState({
    image: "",
    title: "",
    description: "",
    buttonText: "",
  });

  const [sectionTwo, setSectionTwo] = useState({
    image: "",
    title: "",
    description: "",
    content: "",
  });

  const [sectionThree, setSectionThree] = useState({
    title: "",
    description: "",
    buttonTextOne: "",
    buttonTextTwo: "",
  });

  const [sectionFour, setSectionFour] = useState({
    title: "",
    description: "",
    location: "",
    phone: "",
    email: "",
  });

  const [showPreview, setShowPreview] = useState(false);

  // ✅ Fetch saved CMS data on mount
  useEffect(() => {
    async function fetchCMS() {
      try {
        const res = await fetch("/api/cms");
        if (!res.ok) throw new Error("Failed to fetch CMS");
        const data = await res.json();

        if (data) {
          setSectionOne({
            image: data.landingSecOneImage || "",
            title: data.landingSecOneTitle || "",
            description: data.landingSecOneDesc || "",
            buttonText: data.landingSecOneButtonText || "",
          });

          setSectionTwo({
            image: data.landingSecTwoImage || "",
            title: data.landingSecTwoTitle || "",
            description: data.landingSecTwoDesc || "",
            content: data.landingSecTwoContent || "",
          });

          setSectionThree({
            title: data.landingSecThreeTitle || "",
            description: data.landingSecThreeDesc || "",
            buttonTextOne: data.landingSecThreeButtonOne || "",
            buttonTextTwo: data.landingSecThreeButtonTwo || "",
          });

          setSectionFour({
            title: data.landingSecFourTitle || "",
            description: data.landingSecFourDesc || "",
            location: data.landingSecFourLocation || "",
            phone: data.landingSecFourPhoneNum || "",
            email: data.landingSecFourEmail || "",
          });
        }
      } catch (err) {
        console.error(err);
      }
    }

    fetchCMS();
  }, []);

  const handleChangeSectionOne = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      const previewURL = URL.createObjectURL(file);
      setSectionOne((prev) => ({ ...prev, image: previewURL }));
      return;
    }
    setSectionOne((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeSectionTwo = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "image" && files && files[0]) {
      const file = files[0];
      const previewURL = URL.createObjectURL(file);
      setSectionTwo((prev) => ({ ...prev, image: previewURL }));
      return;
    }
    setSectionTwo((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="products-card relative">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-lg lg:text-xl xl:text-2xl">Manage Content</h1>

        {/* Preview Button */}
        <button
          onClick={() => setShowPreview(true)}
          className="bg-[#3C604C] text-sm text-white px-4 py-2 rounded cursor-pointer hover:bg-[#2F4A3A] transition-colors duration-200 ease-linear w-fit text-nowrap lg:text-base flex items-center"
        >
          <span>Preview</span>
        </button>
      </div>

      {/* Form */}
      <CMSForm
        sectionOne={sectionOne}
        sectionTwo={sectionTwo}
        sectionThree={sectionThree}
        sectionFour={sectionFour}
        onChangeSectionOne={handleChangeSectionOne}
        onChangeSectionTwo={handleChangeSectionTwo}
        onChangeSectionThree={(e) =>
          setSectionThree((p) => ({ ...p, [e.target.name]: e.target.value }))
        }
        onChangeSectionFour={(e) =>
          setSectionFour((p) => ({ ...p, [e.target.name]: e.target.value }))
        }
      />

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed bg-white top-0 left-0 z-50 w-full h-full pointer-events-auto overflow-auto">
          <div className="p-6 bg-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Preview</h1>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          <Preview
            sectionOne={sectionOne}
            sectionTwo={sectionTwo}
            sectionThree={sectionThree}
            sectionFour={sectionFour}
          />
        </div>
      )}
    </section>
  );
}

export default CMS;
