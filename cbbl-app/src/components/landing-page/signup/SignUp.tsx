import { useState } from "react";

type SignUpProps = {
  onSignIn: () => void;
};

function SignUp({ onSignIn }: SignUpProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // add error state
  const [successMsg, setSuccessMsg] = useState(""); // add success state

  // Basic regex
  const emailRegex = /^[^\s@]+@gmail\.com$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,32}$/; // 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special character

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg(""); // reset error before submitting
    setSuccessMsg(""); // reset success before submitting

    // Frontend validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMsg(
        "Password must be 8-32 characters and include uppercase, lowercase, number, and special character."
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Show success message instead of alert
      setSuccessMsg(
        "Account created successfully! Verify your account. " +
          `<a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" class="underline font-semibold">Open Gmail</a>`
      );

      // Clear all fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message); // <-- show error message
      } else {
        setErrorMsg("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-screen z-50 flex flex-col items-center justify-center text-[#3C604C]">
      <div className="md:w-1/2 xl:w-1/3 md:h-fit md:rounded-2xl w-full h-full bg-white p-7 text-left">
        <div className="text-center">
          <h1 className="text-3xl font-bold mt-5">Sign Up</h1>
          <p className="mt-1">Create your Coffee Beats account.</p>
        </div>
        <form className="mt-5" onSubmit={handleSignUp}>
          {errorMsg && (
            <p
              className="message-error"
              dangerouslySetInnerHTML={{ __html: errorMsg }}
            />
          )}
          {successMsg && (
            <p
              className="message-success"
              dangerouslySetInnerHTML={{ __html: successMsg }}
            />
          )}
          <div className="flex gap-4">
            <div>
              <label htmlFor="first-name">First Name</label>
              <input
                type="text"
                id="first-name"
                placeholder="First Name"
                className="input-style mb-4 mt-2"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="on"
              />
            </div>
            <div>
              <label htmlFor="last-name">Last Name</label>
              <input
                type="text"
                id="last-name"
                placeholder="Last Name"
                className="input-style mb-4 mt-2"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="on"
              />
            </div>
          </div>

          <label htmlFor="email-signup">Email</label>
          <input
            type="email"
            id="email-signup"
            placeholder="Email"
            className="input-style mb-4 mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="on"
          />

          <label htmlFor="password-signup">Password</label>
          <div className="relative flex items-center mb-4 mt-2">
            <input
              type={showPassword ? "text" : "password"}
              id="password-signup"
              placeholder="Password"
              className="input-style pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="on"
            />
            {password && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <p className="show-hide-password-style">Hide</p>
                ) : (
                  <p className="show-hide-password-style">Show</p>
                )}
              </button>
            )}
          </div>

          <label htmlFor="confirm-password-signup">Confirm Password</label>
          <div className="relative flex items-center mb-3 mt-2">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password-signup"
              placeholder="Password"
              className="input-style pr-10"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && (
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-[#3C604C] focus:outline-none"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <p className="show-hide-password-style">Hide</p>
                ) : (
                  <p className="show-hide-password-style">Show</p>
                )}
              </button>
            )}
          </div>
          <button type="submit" className="button-style mt-2 w-full">
            Sign Up
          </button>
          <p className="text-center mt-5">
            Already have an account?{" "}
            <span
              className="text-[#3C604C] hover:underline font-semibold cursor-pointer"
              onClick={onSignIn}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
