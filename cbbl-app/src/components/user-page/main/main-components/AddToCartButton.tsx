// AddToCartButton.tsx
type AddToCartButtonProps = {
  productId: string;
};

function AddToCartButton({ productId }: AddToCartButtonProps) {
  const handleAddToCart = () => {
    console.log("Adding product to cart:", productId);
    // You can implement your cart logic here
  };

  return (
    <button className="button-style" onClick={handleAddToCart}>
      Add to Cart
    </button>
  );
}

export default AddToCartButton;
