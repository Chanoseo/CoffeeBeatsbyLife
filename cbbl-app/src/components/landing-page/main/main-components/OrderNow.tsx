// OrderNowButton.tsx
function OrderNowButton({ onClick, text }: { onClick?: () => void; text?: string }) {
  return (
    <button className="button-style" onClick={onClick}>
      {text || "Order Now"}
    </button>
  );
}
export default OrderNowButton;
