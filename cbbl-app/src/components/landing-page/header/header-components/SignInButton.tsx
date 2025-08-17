function SignInButton({ onClick }: { onClick?: () => void }) {
    return(
        <button 
            className="button-style"
            onClick={onClick}
        >
            Sign In
        </button>
    )
}
export default SignInButton;