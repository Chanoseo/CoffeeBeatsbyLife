"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
    >
      Logout
    </button>
  );
}
