"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faX } from "@fortawesome/free-solid-svg-icons";

function AddProductForm() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ new state for Product Type
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"FOOD" | "DRINK" | "">("");

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
    setError("");
    setMessage("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // ✅ Extract values for validation
    const name = (
      form.elements.namedItem("name") as HTMLInputElement
    ).value.trim();
    const description = (
      form.elements.namedItem("description") as HTMLTextAreaElement
    ).value.trim();
    const price = (
      form.elements.namedItem("price") as HTMLInputElement
    ).value.trim();

    if (!name || !description || !price || !selectedCategory || !imageFile) {
      setError("Fill all input fields.");
      setLoading(false);
      return;
    }

    // ✅ Append image and categoryId
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.set("categoryId", selectedCategory);
    formData.set("type", selectedType);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Product added successfully!");
        form.reset();
        setImageFile(null);
        setSelectedCategory("");

        // ✅ Reload the page after 3 seconds
        setTimeout(() => window.location.reload(), 3000);
      } else {
        setError("Failed to add product.");
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred.");
    }

    setLoading(false);
  };

  const handleRemoveCategory = async (id: string) => {
    if (!confirm("Are you sure you want to remove this category?")) return;

    try {
      const res = await fetch(`/api/products/categories?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        // Remove from local state
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        if (selectedCategory === id) setSelectedCategory("");
      } else {
        alert(data.error || "Failed to remove category");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while removing category");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="message-error">{error}</p>}
      {message && <p className="message-success">{message}</p>}
      <div className="flex flex-col gap-4">
        {/* Image Preview */}
        {imageFile ? (
          <Image
            src={URL.createObjectURL(imageFile)}
            alt="Selected Image"
            className="mt-2 w-full h-40 object-cover rounded shadow-sm"
            width={300}
            height={300}
          />
        ) : null}
        <div className="flex flex-col gap-2 flex-1">
          {/* Image Upload */}
          <label htmlFor="add-product-image">Upload Image</label>
          <input
            id="add-product-image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="products-input-style"
          />
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Product Name */}
        <div className="flex flex-col gap-2 w-full">
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
        {/* Price */}
        <div className="flex flex-col gap-2 w-full">
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
      </div>
      {/* Description */}
      <div className="flex flex-col gap-2 w-full h-full">
        <label htmlFor="add-product-description">Description</label>
        <textarea
          id="add-product-description"
          name="description"
          placeholder="Enter product description"
          className="products-input-style h-36 resize-none"
        />
      </div>
      {/* Category */}
      <div className="flex flex-col gap-2">
        <label>Category</label>
        {/* Dropdown button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="products-input-style w-full flex items-center justify-between"
          >
            {categories.find((cat) => cat.id === selectedCategory)?.name ||
              "Select Category"}
            <FontAwesomeIcon icon={faAngleDown} />
          </button>
          {/* Dropdown options */}
          {dropdownOpen && (
            <ul className="absolute w-full top-full bg-white border rounded mt-2 max-h-40 overflow-auto z-10 shadow">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center justify-between"
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setDropdownOpen(false);
                  }}
                >
                  {cat.name}
                  <FontAwesomeIcon
                    icon={faX}
                    className="z-50 hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent selecting category
                      handleRemoveCategory(cat.id);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
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

      {/* Type Dropdown (Food or Drink) */}
      <div className="flex flex-col gap-2">
        <label>Type</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
            className="products-input-style w-full flex items-center justify-between"
          >
            {selectedType || "Select Type"}
            <FontAwesomeIcon icon={faAngleDown} />
          </button>
          {typeDropdownOpen && (
            <ul className="absolute w-full top-full bg-white border rounded mt-2 max-h-40 overflow-auto z-10 shadow">
              {["FOOD", "DRINK"].map((t) => (
                <li
                  key={t}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  onClick={() => {
                    setSelectedType(t as "FOOD" | "DRINK");
                    setTypeDropdownOpen(false);
                  }}
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* New/Best Seller */}
      <div className="flex gap-6">
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
