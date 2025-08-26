"use client";

import Image from "next/image";
import { useState } from "react";
import UpdateProduct from "./UpdateProduct";

function ProductsList() {
  const [showUpdateProduct, setShowUpdateProduct] = useState(false);
  const handleToggle = () => {
    setShowUpdateProduct((prev) => !prev);
  };

  return (
    <div className="w-full custom-scrollbar">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-start">
        <div
          className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
          onClick={handleToggle}
        >
          <div className="flex gap-2 absolute top-[2%] right-[5%] z-20">
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">Best Seller</span>
          </div>

          <div className="w-full h-36 overflow-hidden">
            <Image
              src="/cbbl-image.jpg"
              alt="A beautiful scenery"
              width={200}
              height={200}
              className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>

          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <p>Total Order: 200</p>
          </div>
        </div>

        <div
          className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
          onClick={handleToggle}
        >
          <div className="flex gap-2 absolute top-[2%] right-[5%] z-20">
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">Best Seller</span>
          </div>

          <div className="w-full h-36 overflow-hidden">
            <Image
              src="/cbbl-image.jpg"
              alt="A beautiful scenery"
              width={200}
              height={200}
              className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>

          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <p>Total Order: 200</p>
          </div>
        </div>

        <div
          className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
          onClick={handleToggle}
        >
          <div className="flex gap-2 absolute top-[2%] right-[5%] z-20">
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">Best Seller</span>
          </div>

          <div className="w-full h-36 overflow-hidden">
            <Image
              src="/cbbl-image.jpg"
              alt="A beautiful scenery"
              width={200}
              height={200}
              className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>

          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <p>Total Order: 200</p>
          </div>
        </div>

        <div
          className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
          onClick={handleToggle}
        >
          <div className="flex gap-2 absolute top-[2%] right-[5%] z-20">
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">Best Seller</span>
          </div>

          <div className="w-full h-36 overflow-hidden">
            <Image
              src="/cbbl-image.jpg"
              alt="A beautiful scenery"
              width={200}
              height={200}
              className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>

          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <p>Total Order: 200</p>
          </div>
        </div>

        <div
          className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
          onClick={handleToggle}
        >
          <div className="flex gap-2 absolute top-[2%] right-[5%] z-20">
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
            <span className="bg-[#E8E4C9] py-1 px-4 rounded">Best Seller</span>
          </div>

          <div className="w-full h-36 overflow-hidden">
            <Image
              src="/cbbl-image.jpg"
              alt="A beautiful scenery"
              width={200}
              height={200}
              className="w-full h-full object-cover transform transition-transform duration-300 ease-in-out group-hover:scale-110"
            />
          </div>

          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <p>Total Order: 200</p>
          </div>
        </div>
      </div>
      {showUpdateProduct && <UpdateProduct onClose={handleToggle} />}
    </div>
  );
}
export default ProductsList;
