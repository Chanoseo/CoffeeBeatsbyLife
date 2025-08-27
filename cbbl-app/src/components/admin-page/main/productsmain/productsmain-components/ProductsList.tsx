"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import UpdateProduct from "./UpdateProduct";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isNew: boolean;
  isBestSeller: boolean;
  totalOrder: number;
  category?: {
    id: string;
    name: string;
  };
};

function ProductsList() {
  const [showUpdateProduct, setShowUpdateProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowUpdateProduct(true);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="p-4 text-gray-600">Loading products...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  if (products.length === 0) {
    return (
      <p className="p-4 text-gray-600 text-center">No products available.</p>
    );
  }

  return (
    <div className="w-full custom-scrollbar">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-start">
        {products.map((product) => (
          <div
            key={product.id}
            className="relative top-0 bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 h-auto flex flex-col cursor-pointer hover:bg-[#E8E4C9]/30 transition-colors duration-200 ease-linear group"
            onClick={() => handleProductClick(product)}
          >
            <div className="flex gap-2 absolute top-[2%] right-[5%] z-20">
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
                style={{ objectFit: "cover" }} // scales image to cover container
                className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, 200px"
                priority
              />
            </div>

            <div className="p-3 flex flex-col gap-3 text-left">
              <div>
                <h1 className="text-lg font-semibold">{product.name}</h1>
                <p className="text-xs mt-1">
                  {product.category ? product.category.name : "Uncategorized"}
                </p>
                <p className="text-xs mt-1">{product.description}</p>
                <p className="mt-2 underline text-xl">₱ {product.price}</p>
              </div>
              <p>Total Order: {product.totalOrder ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {showUpdateProduct && selectedProduct && (
        <UpdateProduct
          productId={selectedProduct.id}
          initialData={selectedProduct}
          onClose={() => setShowUpdateProduct(false)}
        />
      )}
    </div>
  );
}

export default ProductsList;
