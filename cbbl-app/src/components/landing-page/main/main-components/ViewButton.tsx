function ViewMenuButton({ onClick }: { onClick?: () => void })  {
    return (
        <button className="button-style mt-5" onClick={onClick}>
            View Full Menu
        </button>
    )
}
export default ViewMenuButton;