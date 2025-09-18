"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setMessage("Invalid token");
      setTimeout(() => router.push("/"), 2000); // redirect after 2s
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setMessage(data.message);
        setTimeout(() => router.push("/"), 3000); // redirect after success
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage("Verification failed");
        }
        setTimeout(() => router.push("/"), 3000); // redirect after failure
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-center text-lg">{message}</p>
    </div>
  );
}
