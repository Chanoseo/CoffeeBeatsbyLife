"use client";

import UpdateProductForm from "./UpdateProductForm";

interface UpdateProductProps {
  onClose: () => void;
}

function UpdateProduct({ onClose }: UpdateProductProps) {
  return (
    <div className="fixed p-10 left-0 top-0 w-full h-full z-50 bg-black/40 flex justify-center items-center">
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Update Product</h2>
          <button onClick={onClose} className="button-style">
            Back
          </button>
        </div>
        <UpdateProductForm />
      </div>
    </div>
  );
}

export default UpdateProduct;
