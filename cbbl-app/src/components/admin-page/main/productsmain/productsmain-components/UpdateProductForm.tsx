"use client";

import { faAngleDown, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useEffect, useState } from "react";

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  isNew: boolean;
  isBestSeller: boolean;
  category?: {
    id: string;
    name: string;
  };
};

type UpdateProductFormProps = {
  productId: string;
  initialData: Product;
  onSuccess: () => void;
};

function UpdateProductForm({ productId, initialData }: UpdateProductFormProps) {
  const [name, setName] = useState(initialData.name);
  const [description, setDescription] = useState(initialData.description || "");
  const [price, setPrice] = useState(initialData.price);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState(
    initialData.category?.id || ""
  );
  const [newCategory, setNewCategory] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNew, setIsNew] = useState(initialData.isNew);
  const [isBestSeller, setIsBestSeller] = useState(initialData.isBestSeller);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/products/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    setCategoryLoading(true);
    try {
      const res = await fetch("/api/products/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories([data.category, ...categories]);
        setSelectedCategory(data.category.id);
        setNewCategory("");
      } else {
        setError("Failed to add category");
      }
    } catch (err) {
      console.error(err);
      setError("Error adding category");
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    // ✅ Validation: check required fields
    if (
      !name.trim() ||
      !description.trim() ||
      !price ||
      !selectedCategory ||
      (!imageFile && !initialData.imageUrl)
    ) {
      setError("Fill all input fields");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price.toString());
    formData.append("categoryId", selectedCategory);
    formData.append("isNew", isNew.toString());
    formData.append("isBestSeller", isBestSeller.toString());
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!data.success)
        throw new Error(data.message || "Failed to update product");

      setMessage("Product updated successfully!");

      // ✅ Reload the page after 3 seconds
      setTimeout(() => window.location.reload(), 3000);
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
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
        ) : initialData.imageUrl ? (
          <Image
            src={initialData.imageUrl}
            alt="Current Image"
            className="mt-2 w-full h-40 object-cover rounded shadow-sm"
            width={300}
            height={300}
          />
        ) : null}
        <div className="flex flex-col gap-2 flex-1">
          <label htmlFor="update-product-image">Upload Image</label>
          <input
            id="update-product-image"
            type="file"
            accept="image/*"
            className="products-input-style"
            onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
          />
        </div>
      </div>
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Product Name */}
        <div className="flex flex-col gap-2 w-full">
          <label>Product Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="products-input-style"
            required
          />
        </div>
        {/* Product Price */}
        <div className="flex flex-col gap-2 w-full">
          <label>Price</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="products-input-style"
            required
          />
        </div>
      </div>
      {/* Description */}
      <div className="flex flex-col gap-2 w-full h-full">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
      {/* New/Best Seller */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isNew}
            onChange={() => setIsNew(!isNew)}
          />{" "}
          Is New
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isBestSeller}
            onChange={() => setIsBestSeller(!isBestSeller)}
          />{" "}
          Best Seller
        </label>
      </div>
      {/* Submit Button */}
      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
}

export default UpdateProductForm;
