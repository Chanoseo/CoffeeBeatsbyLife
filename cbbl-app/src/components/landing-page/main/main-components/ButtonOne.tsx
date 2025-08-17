function ButtonOne({ onClick }: { onClick?: () => void }) {
    return (
        <button className="button-style" onClick={onClick}>
            Reserve Your Seat & Order Now
        </button>
    );
}
export default ButtonOne;