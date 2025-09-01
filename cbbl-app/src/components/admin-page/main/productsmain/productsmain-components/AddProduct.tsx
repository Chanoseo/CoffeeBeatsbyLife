"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddProductForm from "./AddProductForm";
import { faX } from "@fortawesome/free-solid-svg-icons";

interface AddProductProps {
  onClose: () => void;
}

function AddProduct({ onClose }: AddProductProps) {
  return (
    <div className="fixed left-0 top-0 w-full h-full z-50 flex justify-end bg-black/10">
      <div className="w-full md:w-1/3 bg-white p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Add New Product</h2>
          <FontAwesomeIcon icon={faX} onClick={onClose} className="text-xl cursor-pointer"/>
        </div>
        <AddProductForm />
      </div>
    </div>
  );
}

export default AddProduct;
