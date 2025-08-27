"use client";

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

function UpdateProductForm({
  productId,
  initialData,
  onSuccess,
}: UpdateProductFormProps) {
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
      setMessage("✅ Product updated successfully!");
      onSuccess();
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

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      <div className="flex flex-col gap-2">
        <label>Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="products-input-style"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="products-input-style h-24 resize-none"
        />
      </div>

      <div className="flex flex-col gap-2">
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

      <div className="flex flex-col gap-2">
        <label htmlFor="update-product-image">Upload Image</label>
        <input
          id="update-product-image"
          type="file"
          accept="image/*"
          className="products-input-style"
          onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
        />
        {imageFile && (
          <p className="text-sm text-gray-600">Selected: {imageFile.name}</p>
        )}
        {!imageFile && initialData.imageUrl && (
          <p className="text-sm text-gray-600">
            Current: {initialData.imageUrl}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label>Category</label>
        <select
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

      <div className="flex flex-col gap-2">
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

      <button type="submit" className="button-style" disabled={loading}>
        {loading ? "Updating..." : "Update Product"}
      </button>
    </form>
  );
}

export default UpdateProductForm;
