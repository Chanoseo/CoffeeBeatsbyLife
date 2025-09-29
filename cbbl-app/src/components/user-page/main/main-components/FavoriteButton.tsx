"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

type FavoriteHeartProps = {
  productId: string;
  onToggle?: (productId: string, isFavorite: boolean) => void; // callback
};

export default function FavoriteButton({
  productId,
  onToggle,
}: FavoriteHeartProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?productId=${productId}`);
        const data = await res.json();
        setIsFavorite(data.favorited);
      } catch (err) {
        console.error(err);
      }
    };
    fetchFavorite();
  }, [productId]);

  const toggleFavorite = async () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 200);

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.favorited);
        if (onToggle) onToggle(productId, data.favorited); // notify parent
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={`
        w-10 h-10 flex items-center justify-center rounded-full
        transition-all duration-200
        ${
          isFavorite
            ? "bg-red-500/50 text-red-500"
            : "bg-white/50 text-white hover:bg-red-500/50 hover:text-red-500"
        }
        ${isAnimating ? "scale-110 shadow-lg" : "shadow-md"}
        backdrop-blur-sm
      `}
    >
      <FontAwesomeIcon icon={faHeart} className="text-lg" />
    </button>
  );
}
