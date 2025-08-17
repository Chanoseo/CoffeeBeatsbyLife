import { useState } from "react";

type SignUpProps = {
    onSignIn: () => void;
};

function SignUp({ onSignIn }: SignUpProps) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setconfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="fixed inset-0 w-full h-screen z-50 flex flex-col items-center justify-center text-[#3C604C]">
            <div className="w-1/3 bg-white rounded-2xl p-7 text-left">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mt-5">Sign Up</h1>
                    <p className="mt-1">Create your Coffee Beats account.</p>
                </div>
                <form className="mt-5">
                    <div className="flex gap-4">
                        {/* First Name */}
                        <div>
                            <label htmlFor="first-name">First Name</label>
                            <input type="text" id="first-name" placeholder="First Name" className="input-style mb-4 mt-2" autoComplete="on"/>
                        </div>
                        {/* Last Name */}
                        <div>
                            <label htmlFor="last-name">Last Name</label>
                            <input type="text" id="last-name" placeholder="Last Name" className="input-style mb-4 mt-2" autoComplete="on"/>
                        </div>
                    </div>
                    {/* Email */}
                    <label htmlFor="email-signup">Email</label>
                    <input type="email" id="email-signup" placeholder="Email" className="input-style mb-4 mt-2" autoComplete="on"/>
                    {/* Password */}
                    <label htmlFor="password-signup">Password</label>
                    <div className="relative flex items-center mb-4 mt-2">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password-signup"
                            placeholder="Password"
                            className="input-style pr-10"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="on"
                        />
                        {password && (
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                                onClick={() => setShowPassword(prev => !prev)}
                                tabIndex={0}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <p className="show-hide-password-style">Hide</p> : <p className="show-hide-password-style">Show</p>}
                            </button>
                        )}
                    </div>
                    {/* Confirm Password */}
                    <label htmlFor="confirm-password-signup">Confirm Password</label>
                    <div className="relative flex items-center mb-3 mt-2">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="confirm-password-signup"
                            placeholder="Password"
                            className="input-style pr-10"
                            value={confirmPassword}
                            onChange={e => setconfirmPassword(e.target.value)}
                        />
                        {confirmPassword && (
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                                onClick={() => setShowPassword(prev => !prev)}
                                tabIndex={0}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <p className="show-hide-password-style">Hide</p> : <p className="show-hide-password-style">Show</p>}
                            </button>
                        )}
                    </div>
                    {/* Sign Up */}
                    <button type="submit" className="button-style mt-2 w-full">Sign Up</button>
                    <p className="text-center mt-5">Already have an account? <span className="text-[#3C604C] hover:underline font-semibold cursor-pointer" onClick={onSignIn}>Sign In</span></p>
                </form>
            </div>
        </div>
    );
}
export default SignUp;