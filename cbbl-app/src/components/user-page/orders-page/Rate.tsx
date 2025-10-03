"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

function Rate({
  orderId,
  items,
}: {
  orderId: string;
  items: {
    id: string;
    product: { id: string; name: string; imageUrl: string };
  }[];
}) {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const [categories, setCategories] = useState<Record<string, number>>({});
  const [hoveredCategories, setHoveredCategories] = useState<
    Record<string, number>
  >({});
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    async function checkRated() {
      try {
        const res = await fetch(`/api/order-ratings?orderId=${orderId}`);
        const data = await res.json();
        if (data.success && data.alreadyRated) {
          setAlreadyRated(true);
        }
      } catch (err) {
        console.error("Failed to check rating:", err);
      }
    }
    checkRated();
  }, [orderId]);

  const categoryList = [
    "App Experience",
    "Order Completeness",
    "Speed of Service",
    "Value for money",
    "Reservation Experience",
    "Overall Satisfaction",
  ];

  const handleRating = (productId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [productId]: value }));
  };

  const handleHover = (productId: string, value: number) => {
    setHovered((prev) => ({ ...prev, [productId]: value }));
  };

  const handleReviewChange = (productId: string, text: string) => {
    setReviews((prev) => ({ ...prev, [productId]: text }));
  };

  const handleCategoryRating = (category: string, value: number) => {
    setCategories((prev) => ({ ...prev, [category]: value }));
  };

  const handleCategoryHover = (category: string, value: number) => {
    setHoveredCategories((prev) => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/order-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          ratings,
          reviews,
          categories,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        alert("Failed to submit rating.");
      }
    } catch (err) {
      console.error("Error submitting rating:", err);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 text-center bg-white rounded-lg">
        <h1 className="text-2xl font-bold mb-2 text-green-600">
          Thank you! 🎉
        </h1>
        <p className="text-gray-600 text-sm">Your feedback helps us improve.</p>
      </div>
    );
  }

  //   const categoryDescriptions: Record<string, string> = {
  //     "App Experience": "Was the app easy to use and navigate?",
  //     "Order Completeness": "Did you receive everything you ordered?",
  //     "Speed of Service": "How fast was the order prepared and served?",
  //     "Value for money": "Was the purchase worth the price?",
  //     "Reservation Experience": "Was reserving a seat easy and hassle-free?",
  //     "Overall Satisfaction": "How satisfied are you overall?",
  //   };

  // ✅ Require all categories and all items to be rated
  const isAllRated =
    categoryList.every((cat) => categories[cat] && categories[cat] > 0) &&
    items.every(
      (item) => ratings[item.product.id] && ratings[item.product.id] > 0
    );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Category Ratings */}
      {categoryList.map((category) => (
        <div key={category}>
          <h2 className="text-base font-semibold text-gray-900">{category}</h2>
          {/* <p className="text-sm text-gray-500">
            {categoryDescriptions[category]}
          </p> */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-2xl ${
                  (hoveredCategories[category] || categories[category]) >= star
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                onClick={() => handleCategoryRating(category, star)}
                onMouseEnter={() => handleCategoryHover(category, star)}
                onMouseLeave={() => handleCategoryHover(category, 0)}
              >
                ★
              </button>
            ))}
          </div>

          {category === "Overall Satisfaction" && (
            <textarea
              value={reviews["overall"] || ""}
              onChange={(e) =>
                setReviews((prev) => ({ ...prev, overall: e.target.value }))
              }
              placeholder="Share your overall experience (optional)"
              className="w-full mt-3 p-2 border border-gray-200 rounded-md focus:outline-none text-sm resize-none h-20 leading-snug"
            />
          )}
        </div>
      ))}

      {/* Product Ratings */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Rate Your Ordered Products
        </h2>

        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.id} className="border-b border-gray-200 pb-5">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>

                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {item.product.name}
                  </p>

                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`text-2xl ${
                          (hovered[item.product.id] ||
                            ratings[item.product.id]) >= star
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        onClick={() => handleRating(item.product.id, star)}
                        onMouseEnter={() => handleHover(item.product.id, star)}
                        onMouseLeave={() => handleHover(item.product.id, 0)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                value={reviews[item.product.id] || ""}
                onChange={(e) =>
                  handleReviewChange(item.product.id, e.target.value)
                }
                placeholder="Share your thoughts about this product (optional)"
                className="w-full mt-3 p-2 border border-gray-200 rounded-md focus:outline-none text-sm resize-none h-20 leading-snug"
              ></textarea>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          className={`w-full py-3 px-4 rounded-md font-medium text-base ${
            alreadyRated
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : !isAllRated
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-red-500 text-white"
          }`}
          disabled={alreadyRated || !isAllRated}
        >
          {alreadyRated ? "Already Rated" : "Submit Feedback"}
        </button>
      </div>
    </form>
  );
}

export default Rate;
