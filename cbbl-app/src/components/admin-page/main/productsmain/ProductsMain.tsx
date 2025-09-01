"use client";

import { useState } from "react";
import Products from "./productsmain-components/Products";
import ProductsHeader from "./productsmain-components/ProductsHeader";

interface ProductsMainProps {
  collapsed: boolean;
  toggleNav: () => void;
}

function ProductsMain({ toggleNav }: ProductsMainProps) {
  const [searchInput, setSearchInput] = useState("");

  return (
    <main className="w-full h-screen overflow-auto text-brown relative">
      <ProductsHeader
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        toggleNav={toggleNav} // pass toggle
      />
      <Products searchInput={searchInput} />
    </main>
  );
}

export default ProductsMain;
