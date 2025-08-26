"use client";
import { useState } from "react";

function AddProductForm() {
  const [categories, setCategories] = useState([
    "Hot Coffee",
    "Cold Brew",
    "Espresso",
  ]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleAddCategory = () => {
    if (newCategory.trim() !== "" && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setSelectedCategory(newCategory);
      setNewCategory("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <form className="flex flex-col gap-4">
      {/* Product Name */}
      <div className="flex flex-col gap-2">
        <label htmlFor="add-product-name">Product Name</label>
        <input
          id="add-product-name"
          name="name"
          type="text"
          placeholder="Enter product name"
          className="products-input-style"
          required
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label htmlFor="add-product-description">Description</label>
        <textarea
          id="add-product-description"
          name="description"
          placeholder="Enter product description"
          className="products-input-style h-24 resize-none"
        />
      </div>

      {/* Price */}
      <div className="flex flex-col gap-2">
        <label htmlFor="add-product-price">Price</label>
        <input
          id="add-product-price"
          name="price"
          type="number"
          step="0.01"
          placeholder="Enter price"
          className="products-input-style"
          required
        />
      </div>

      {/* Image Upload */}
      <div className="flex flex-col gap-2">
        <label htmlFor="add-product-image">Upload Image</label>
        <input
          id="add-product-image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="products-input-style"
        />
        {imageFile && (
          <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>
        )}
      </div>

      {/* Category with Add Option */}
      <div className="flex flex-col gap-2">
        <label htmlFor="add-product-category">Category</label>
        <select
          id="add-product-category"
          name="category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="products-input-style"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Add New Category */}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="products-input-style flex-1"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="button-style"
          >
            Add
          </button>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isNew" /> Is New
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isBestSeller" /> Best Seller
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="button-style"
      >
        Add Product
      </button>
    </form>
  );
}

export default AddProductForm;
