"use client";

import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import SignUp from "../signup/SignUp";

const LOCKOUT_DURATION = 3 * 60; // 3 minutes in seconds
const MAX_ATTEMPTS = 3;

function SignIn() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [timer, setTimer] = useState(0); // timer in seconds

  // Initialize attempts & timer from localStorage
  useEffect(() => {
    const storedUnlockTime = parseInt(
      localStorage.getItem("unlockTime") || "0"
    );
    const remaining = Math.floor((storedUnlockTime - Date.now()) / 1000);

    if (remaining > 0) {
      setIsDisabled(true);
      setTimer(remaining);
    } else {
      // Clear attempts if lockout expired
      localStorage.removeItem("attempts");
      localStorage.removeItem("unlockTime");
      setIsDisabled(false);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (isDisabled && timer > 0) {
      interval = window.setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsDisabled(false);
            setErrorMsg("");
            // Reset attempts when timer ends
            localStorage.removeItem("attempts");
            localStorage.removeItem("unlockTime");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDisabled, timer]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDisabled) return;

    const email = (document.getElementById("email-signin") as HTMLInputElement)
      .value;

    // ✅ Validation for empty fields
    if (!email || !password) {
      setErrorMsg("Email and password are required.");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    // Get attempts and unlockTime
    let currentAttempts = parseInt(localStorage.getItem("attempts") || "0");
    const storedUnlockTime = parseInt(
      localStorage.getItem("unlockTime") || "0"
    );

    // Reset attempts if previous lockout expired
    if (storedUnlockTime && Date.now() > storedUnlockTime) {
      currentAttempts = 0;
      localStorage.removeItem("attempts");
      localStorage.removeItem("unlockTime");
    }

    if (res?.error) {
      // If unverified email, don't count attempt
      if (res.error === "Please verify your email first.") {
        setErrorMsg(res.error);
        return;
      }

      currentAttempts += 1;
      localStorage.setItem("attempts", currentAttempts.toString());

      if (currentAttempts >= MAX_ATTEMPTS) {
        setErrorMsg("Too many attempts. Please try again later.");
        setIsDisabled(true);
        setTimer(LOCKOUT_DURATION);
        localStorage.setItem(
          "unlockTime",
          (Date.now() + LOCKOUT_DURATION * 1000).toString()
        );
      } else {
        setErrorMsg("Incorrect email or password. Please try again.");
      }
    } else {
      // Successful login: clear attempts
      setErrorMsg("");
      localStorage.removeItem("attempts");
      localStorage.removeItem("unlockTime");

      if (res?.ok) window.location.href = "/home";
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="fixed inset-0 w-full h-screen bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-[#3C604C]">
      <div className="md:w-1/2 xl:w-1/3 md:h-fit md:rounded-2xl w-full h-full bg-white p-7 text-left relative">
        <div>
          <div className="text-center">
            <h1 className="text-3xl font-bold mt-5">Sign In</h1>
            <p className="mt-1">
              Enter your credentials to access your Coffee Beats account.
            </p>
          </div>
          <form className="mt-5" onSubmit={handleSignIn}>
            {errorMsg && <p className="message-error">{errorMsg}</p>}
            {isDisabled && (
              <p className="text-sm text-gray-500 mb-2 text-center">
                Try again in {formatTimer(timer)}
              </p>
            )}
            {/* Email Input */}
            <label htmlFor="email-signin">Email</label>
            <input
              type="email"
              id="email-signin"
              placeholder="Email"
              className="input-style mb-4 mt-2"
              autoComplete="on"
            />
            {/* Password Input */}
            <label htmlFor="password-signin">Password</label>
            <div className="relative flex items-center mt-2">
              <input
                type={showPassword ? "text" : "password"}
                id="password-signin"
                placeholder="Password"
                className="input-style pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={0}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <p className="show-hide-password-style">Hide</p>
                  ) : (
                    <p className="show-hide-password-style">Show</p>
                  )}
                </button>
              )}
            </div>
            {/* Remember Me and Forgot Passoword */}
            <div className="mt-2 w-full text-right flex justify-between items-center">
              <div className="flex justify-center items-center text-sm cursor-pointer">
                <input
                  type="checkbox"
                  id="remember-me"
                  className="mr-2 accent-[#3C604C]"
                />
                <label htmlFor="remember-me">Remember me</label>
              </div>
              <span
                className="text-[#3C604C] text-sm hover:underline cursor-pointer"
                onClick={() => (window.location.href = "/forgot-password")} // ✅ safe redirect
              >
                Forgot Password?
              </span>
            </div>
            {/* Sign In Button */}
            <button type="submit" className="button-style mt-2 w-full">
              Sign In
            </button>
            <div className="flex items-center my-4">
              <hr className="flex-1 border-t border-gray-300" />
              <span className="mx-2 text-gray-500">or</span>
              <hr className="flex-1 border-t border-gray-300" />
            </div>
            {/* Sign In with Google */}
            <div className="flex flex-col justify-center items-center gap-2">
              <button
                type="button"
                className="w-full px-4 py-2 flex justify-center items-center border rounded border-gray-200 hover:bg-gray-100 cursor-pointer"
                onClick={async () => {
                  // Sign out first without redirect
                  await signOut({ redirect: false });

                  // Then sign in with Google
                  signIn("google", {
                    callbackUrl: "/home",
                    prompt: "select_account", // Optional, ensures account chooser
                  });
                }}
              >
                <Image
                  src="/google-icon.svg"
                  alt="Google Icon"
                  width={35}
                  height={35}
                  className="inline-block mr-2"
                />
                Sign in with Google
              </button>
            </div>
            {/* Sign Up */}
            <p className="text-center mt-5">
              Don&apos;t have an account?{" "}
              <span
                className="text-[#3C604C] hover:underline font-semibold cursor-pointer"
                onClick={() => setShowSignUp(true)}
              >
                Sign Up
              </span>
            </p>
          </form>
        </div>
        {showSignUp && <SignUp onSignIn={() => setShowSignUp(false)} />}
      </div>
    </div>
  );
}
export default SignIn;
