"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateProductForm, { Product } from "./UpdateProductForm";
import { faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

interface UpdateProductProps {
  onClose: () => void;
  onRefresh: () => void; // ✅ add refresh callback
  productId: string;
  initialData: Product;
}

function UpdateProduct({
  onClose,
  onRefresh,
  productId,
  initialData,
}: UpdateProductProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to call the DELETE API
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Product deleted successfully!");
        onRefresh(); // Refresh product list
        onClose(); // Close modal
      } else {
        setError(data.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while deleting the product.");
    }
  };

  return (
    <div className="fixed left-0 top-0 w-full h-full z-50 flex justify-end bg-black/10">
      <div className="w-full md:w-1/3 bg-white p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Update Product</h2>
          <div className="flex items-center gap-4">
            <FontAwesomeIcon
              icon={faTrash}
              onClick={handleDelete}
              className="text-xl text-red-500 hover:text-red-600 cursor-pointer"
            />
            <FontAwesomeIcon
              icon={faX}
              onClick={onClose}
              className="text-xl cursor-pointer"
            />
          </div>
        </div>

        {/* Inline messages */}
        {error && <p className="message-error mb-2">{error}</p>}
        {success && <p className="message-success mb-2">{success}</p>}

        <UpdateProductForm
          productId={productId}
          initialData={initialData}
          onSuccess={() => {
            onRefresh(); // Refresh after form update
          }}
        />
      </div>
    </div>
  );
}

export default UpdateProduct;
