function OrderNowButton({ onClick }: { onClick?: () => void }) {
    return (
        <button className="button-style" onClick={onClick}>
            Order Now
        </button>
    );
}
export default OrderNowButton;