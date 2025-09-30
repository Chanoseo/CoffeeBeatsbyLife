"use client";

import { signOut } from "next-auth/react";

function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })} 
      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
}

export default SignOutButton;
