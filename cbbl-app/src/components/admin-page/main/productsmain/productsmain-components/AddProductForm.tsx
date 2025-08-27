"use client";

import { useEffect, useState } from "react";

function AddProductForm() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ✅ Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/products/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Handle adding a new category
  const handleAddCategory = async () => {
    const trimmedCategory = newCategory.trim();
    if (!trimmedCategory) return;

    setCategoryLoading(true);
    try {
      const res = await fetch("/api/products/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedCategory }),
      });

      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [data.category, ...prev]); // ✅ Add new category to the list
        setSelectedCategory(data.category.id); // Auto-select new category
        setNewCategory(""); // Clear input
      } else {
        alert("Failed to add category.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding category.");
    }
    setCategoryLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData(e.target as HTMLFormElement);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.set("categoryId", selectedCategory);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Product added successfully!");
        (e.target as HTMLFormElement).reset();
        setImageFile(null);
        setSelectedCategory("");
      } else {
        setMessage("Failed to add product.");
      }
    } catch (error) {
      console.error(error);
      setMessage("An error occurred.");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Product Name */}
      {message && <p className="message-success">{message}</p>}
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
        {imageFile && <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <label htmlFor="add-product-category">Category</label>
        <select
          id="add-product-category"
          name="categoryId"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="products-input-style"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
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
            disabled={categoryLoading}
          >
            {categoryLoading ? "Adding..." : "Add"}
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
      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Adding..." : "Add Product"}
      </button>
    </form>
  );
}

export default AddProductForm;
