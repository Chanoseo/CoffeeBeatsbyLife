import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import SignUp from "../signup/SignUp";

function SignIn() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    return(
        <div className="fixed inset-0 w-full h-screen bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-[#3C604C]">
            <div className="w-1/3 bg-white rounded-2xl p-7 text-left relative">
                <div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mt-5">Sign In</h1>
                        <p className="mt-1">Enter your credentials to access your Coffee Beats account.</p>
                    </div>
                    <form className="mt-5">
                        {/* Email Input */}
                        <label htmlFor="email-signin">Email</label>
                        <input type="email" id="email-signin" placeholder="Email" className="input-style mb-4 mt-2" autoComplete="on"/>
                        {/* Password Input */}
                        <label htmlFor="password-signin">Password</label>
                        <div className="relative flex items-center mt-2">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password-signin"
                                placeholder="Password"
                                className="input-style pr-10"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
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
                        {/* Remember Me and Forgot Passoword */}
                        <div className="mt-2 w-full text-right flex justify-between items-center">
                            <div className="flex justify-center items-center text-sm cursor-pointer">
                                <input type="checkbox" id="remember-me" className="mr-2 accent-[#3C604C]" />
                                <label htmlFor="remember-me">Remember me</label>
                            </div>
                            <Link href="/forgot-password" className="text-[#3C604C] text-sm hover:underline">Forgot Password?</Link>
                        </div>
                        {/* Sign In Button */}
                        <button type="submit" className="button-style mt-2 w-full">Sign In</button>
                        <div className="flex items-center my-4">
                            <hr className="flex-1 border-t border-gray-300" />
                            <span className="mx-2 text-gray-500">or</span>
                            <hr className="flex-1 border-t border-gray-300" />
                        </div>
                        {/* Sign In with Google */}
                        <div className="flex flex-col justify-center items-center gap-2">
                            <button className="w-full px-4 py-2 flex justify-center items-center border rounded border-gray-200 hover:bg-gray-100 cursor-pointer">
                                <Image src="/google-icon.svg" alt="Google Icon" width={35} height={35} className="inline-block mr-2"/>Sign in with Google
                            </button>
                        </div>
                        {/* Sign Up */}
                        <p className="text-center mt-5">Don&apos;t have an account? <span className="text-[#3C604C] hover:underline font-semibold cursor-pointer" onClick={() => setShowSignUp(true)}>Sign Up</span></p>
                    </form>
                </div>
                {showSignUp && (
                    <SignUp onSignIn={() => setShowSignUp(false)} />
                )}
            </div>
        </div>
    )
}
export default SignIn;