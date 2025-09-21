"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import UpdateProduct from "./UpdateProduct";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isNew: boolean;
  isBestSeller: boolean;
  totalOrders: number;
  type: string;
  category?: {
    id: string;
    name: string;
  };
};

type ProductsListProps = {
  selectedCategory?: string;
  searchInput: string;
};

function ProductsList({ selectedCategory, searchInput }: ProductsListProps) {
  const [showUpdateProduct, setShowUpdateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowUpdateProduct(true);
  };

  // ✅ useCallback so it’s stable and can be reused
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");

      let data: Product[] = await res.json();

      if (selectedCategory) {
        data = data.filter(
          (product) => product.category?.id === selectedCategory
        );
      }

      if (searchInput) {
        data = data.filter((product) =>
          product.name.toLowerCase().includes(searchInput.toLowerCase())
        );
      }

      setProducts(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchInput]);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [fetchProducts]);

  if (loading)
    return (
      <p className="p-4 text-gray-600 text-sm md:text-base">
        Loading products...
      </p>
    );

  if (error)
    return (
      <p className="p-4 text-red-500 text-sm md:text-base">Error: {error}</p>
    );

  if (products.length === 0) {
    return (
      <p className="p-4 text-gray-600 text-center text-sm md:text-base">
        No products available.
      </p>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-start">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
            onClick={() => handleProductClick(product)}
          >
            <div className="flex gap-2 absolute top-[2%] right-[5%] z-10 text-sm">
              {product.isNew && (
                <span className="bg-[#E8E4C9] py-1 px-4 rounded">New</span>
              )}
              {product.isBestSeller && (
                <span className="bg-[#E8E4C9] py-1 px-4 rounded">
                  Best Seller
                </span>
              )}
            </div>

            <div className="w-full h-36 relative overflow-hidden rounded-t-xl">
              <Image
                src={product.imageUrl || "/default-image.jpg"}
                alt={product.name}
                fill
                style={{ objectFit: "cover" }}
                className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 200px"
                priority
              />
            </div>

            <div className="p-3 flex flex-col gap-3 text-left">
              <div>
                <h1 className="md:text-lg text-md font-semibold truncate">
                  {product.name}
                </h1>
                <p className="text-xs mt-1">
                  {product.category ? product.category.name : "Uncategorized"}
                </p>
                <p className="text-xs mt-1 line-clamp-2">
                  {product.description}
                </p>
                <p className="md:text-xl mt-2 underline text-md">
                  ₱ {product.price}
                </p>
              </div>
              <p className="text-sm truncate md:text-base">
                Total Orders: {product.totalOrders ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {showUpdateProduct && selectedProduct && (
        <UpdateProduct
          productId={selectedProduct.id}
          initialData={selectedProduct}
          onClose={() => setShowUpdateProduct(false)}
          onRefresh={fetchProducts} // ✅ still works
        />
      )}
    </div>
  );
}

export default ProductsList;
