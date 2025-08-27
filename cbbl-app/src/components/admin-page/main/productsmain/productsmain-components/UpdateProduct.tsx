"use client";

import UpdateProductForm, { Product } from "./UpdateProductForm";

interface UpdateProductProps {
  onClose: () => void;
  productId: string;
  initialData: Product;
}

function UpdateProduct({
  onClose,
  productId,
  initialData,
}: UpdateProductProps) {
  // Function to call the DELETE API
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("Product deleted successfully!");
        // ✅ Close modal
        onClose();
        // ✅ Reload the page
        window.location.reload();
      } else {
        alert(data.message || "Failed to delete product.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while deleting the product.");
    }
  };

  return (
    <div className="fixed p-10 left-0 top-0 w-full h-full z-50 bg-black/40 flex justify-center items-center">
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Update Product</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDelete}
              className="button-style bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </button>
            <button onClick={onClose} className="button-style">
              Back
            </button>
          </div>
        </div>
        <UpdateProductForm
          productId={productId}
          initialData={initialData}
          onSuccess={onClose}
        />
      </div>
    </div>
  );
}

export default UpdateProduct;
