"use client";

import Image from "next/image";
import OrderNowButton from "./OrderNow";
import ViewMenuButton from "./ViewButton";
import SignIn from "../../pop-up-signin/SignIn";
import { useEffect, useRef, useState, useCallback } from "react";

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasOverflow, setHasOverflow] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // ✅ Fetch data
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

  // ✅ Memoized handlers
  const updateCurrentIndex = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(
      el.querySelectorAll<HTMLElement>(".carousel-item")
    );
    if (children.length === 0) return;

    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    children.forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    setCurrentIndex(closestIndex);
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      updateCurrentIndex();
    });
  }, [updateCurrentIndex]);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setHasOverflow(el.scrollWidth > el.clientWidth + 5);
    }
  }, []);

  // ✅ Scroll + resize effect
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkOverflow);
    window.addEventListener("resize", updateCurrentIndex);

    const id = window.setTimeout(() => {
      checkOverflow();
      updateCurrentIndex();
    }, 200);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkOverflow);
      window.removeEventListener("resize", updateCurrentIndex);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearTimeout(id);
    };
  }, [products, handleScroll, checkOverflow, updateCurrentIndex]);

  // ✅ Auto-center first item
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.querySelector<HTMLElement>(".carousel-item");
    if (first) {
      const left = first.offsetLeft - (el.clientWidth - first.offsetWidth) / 2;
      el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
    const id = window.setTimeout(() => {
      updateCurrentIndex();
      checkOverflow();
    }, 250);
    return () => clearTimeout(id);
  }, [products.length, updateCurrentIndex, checkOverflow]);

  const goToIndex = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const children = Array.from(
      el.querySelectorAll<HTMLElement>(".carousel-item")
    );
    const child = children[index];
    if (!child) return;
    const left = child.offsetLeft - (el.clientWidth - child.offsetWidth) / 2;
    el.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  };

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

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto scrollbar-hide p-1 scroll-smooth snap-x snap-mandatory"
      >
        <div className="flex gap-5 mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="carousel-item bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-68 md:w-64 h-auto flex flex-col snap-center"
              style={{ scrollSnapAlign: "center" }}
            >
              <div className="bg-gray-200">
                <Image
                  src={product.imageUrl || "/cbbl-image.jpg"}
                  alt={product.name}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                  priority
                />
              </div>
              <div className="p-4 flex flex-col justify-between gap-4 text-left h-full">
                <div>
                  <h1 className="md:text-xl text-lg font-bold">
                    {product.name}
                  </h1>
                  <p className="md:text-sm text-xs mt-1">
                    {product.description}
                  </p>
                  <p className="md:text-2xl mt-2 underline text-xl">
                    ₱ {product.price.toFixed(2)}
                  </p>
                </div>
                <OrderNowButton
                  onClick={() => setShowSignIn(true)}
                  text={cmsData.landingSecThreeButtonOne}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Indicators only if overflow */}
      {hasOverflow && (
        <div className="flex justify-center mt-4 gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to item ${index + 1}`}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none ${
                currentIndex === index ? "bg-brown scale-125" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}

      <ViewMenuButton
        onClick={() => setShowSignIn(true)}
        text={cmsData.landingSecThreeButtonTwo}
      />
      {showSignIn && <SignIn />}
    </section>
  );
}

export default SectionThree;
