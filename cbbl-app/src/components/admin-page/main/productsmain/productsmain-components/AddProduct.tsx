"use client";

import AddProductForm from "./AddProductForm";

interface AddProductProps {
  onClose: () => void;
}

function AddProduct({ onClose }: AddProductProps) {
  return (
    <div className="fixed p-10 left-0 top-0 w-full h-full z-50 bg-black/40 flex justify-center items-center">
      <div className="w-1/2 bg-white p-6 rounded-lg shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Add New Product</h2>
          <button onClick={onClose} className="button-style">
            Back
          </button>
        </div>
        <AddProductForm />
      </div>
    </div>
  );
}

export default AddProduct;
