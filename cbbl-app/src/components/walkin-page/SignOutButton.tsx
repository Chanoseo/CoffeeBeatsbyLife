"use client";

import { signOut } from "next-auth/react";

function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} 
      className="button-style"
    >
      Logout
    </button>
  );
}

export default SignOutButton;
