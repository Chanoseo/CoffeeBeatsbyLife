"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl: string;
  totalOrders: number;
};

type Props = {
  data: {
    title: string;
    description: string;
    buttonTextOne: string;
    buttonTextTwo: string;
  };
};

function PreviewThree({ data }: Props) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/product-cms")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section
      className="md:px-30 bg-[#E4E0D6]/20 py-10 px-5 text-center text-brown"
      id="menu"
    >
      {/* Dynamic Section Three Title & Description */}
      <div className="mb-10">
        <h1 className="md:text-5xl text-3xl font-bold mb-3">{data.title}</h1>
        <p className="md:text-xl text-base">{data.description}</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,auto))] gap-5 justify-center">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/20 w-64 h-auto flex flex-col"
          >
            <Image
              src={product.imageUrl}
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
              <button className="button-style">{data.buttonTextOne}</button>
            </div>
          </div>
        ))}
      </div>

      <button className="button-style mt-5">{data.buttonTextTwo}</button>
    </section>
  );
}

export default PreviewThree;
