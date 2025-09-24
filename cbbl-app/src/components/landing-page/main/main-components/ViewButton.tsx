// ViewMenuButton.tsx
function ViewMenuButton({ onClick, text }: { onClick?: () => void; text?: string }) {
  return (
    <button className="button-style mt-5" onClick={onClick}>
      {text || "View Full Menu"}
    </button>
  );
}
export default ViewMenuButton;
