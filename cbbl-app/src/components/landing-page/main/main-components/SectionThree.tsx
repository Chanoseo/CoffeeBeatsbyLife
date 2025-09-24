"use client";

import Image from "next/image";
import OrderNowButton from "./OrderNow";
import ViewMenuButton from "./ViewButton";
import SignIn from "../../pop-up-signin/SignIn";
import { useEffect, useState } from "react";

type SectionThreeData = {
  landingSecThreeTitle?: string;
  landingSecThreeDesc?: string;
  landingSecThreeButtonOne?: string;
  landingSecThreeButtonTwo?: string;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  totalOrders: number;
};

function SectionThree() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [cmsData, setCmsData] = useState<SectionThreeData>({
    landingSecThreeTitle: "Signature Offerings",
    landingSecThreeDesc: "Every brew, every beat—made to move you.",
    landingSecThreeButtonOne: "Order Now",
    landingSecThreeButtonTwo: "View Full Menu",
  });
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchCMS() {
      try {
        const res = await fetch("/api/cms");
        const data = await res.json();
        setCmsData((prev) => ({
          landingSecThreeTitle:
            data.landingSecThreeTitle || prev.landingSecThreeTitle,
          landingSecThreeDesc:
            data.landingSecThreeDesc || prev.landingSecThreeDesc,
          landingSecThreeButtonOne:
            data.landingSecThreeButtonOne || prev.landingSecThreeButtonOne,
          landingSecThreeButtonTwo:
            data.landingSecThreeButtonTwo || prev.landingSecThreeButtonTwo,
        }));
      } catch (err) {
        console.error("Failed to fetch CMS:", err);
      }
    }

    async function fetchProducts() {
      try {
        const res = await fetch("/api/product-cms");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }

    fetchCMS();
    fetchProducts();
  }, []);

  return (
    <section
      className="md:px-30 bg-[#E4E0D6]/20 py-10 px-5 text-center text-brown"
      id="menu"
    >
      <div className="mb-10">
        <h1 className="md:text-5xl text-3xl font-bold mb-3">
          {cmsData.landingSecThreeTitle}
        </h1>
        <p className="md:text-xl text-base">{cmsData.landingSecThreeDesc}</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,auto))] gap-5 justify-center">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-64 h-auto flex flex-col"
          >
            <Image
              src={product.imageUrl || "/cbbl-image.jpg"}
              alt={product.name}
              width={300}
              height={300}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex flex-col gap-4 text-left">
              <div>
                <h1 className="md:text-xl text-lg font-bold">{product.name}</h1>
                <p className="md:text-sm text-xs mt-1">{product.description}</p>
                <p className="md:text-2xl mt-2 underline text-xl">
                  ₱ {product.price.toFixed(2)}
                </p>
              </div>
              {/* Use CMS button text */}
              <OrderNowButton
                onClick={() => setShowSignIn(true)}
                text={cmsData.landingSecThreeButtonOne}
              />
            </div>
          </div>
        ))}
      </div>

      <ViewMenuButton
        onClick={() => setShowSignIn(true)}
        text={cmsData.landingSecThreeButtonTwo}
      />
      {showSignIn && <SignIn />}
    </section>
  );
}

export default SectionThree;
