"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      setMessage("Invalid token");
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

        // Optional: redirect to login after 3s
        setTimeout(() => router.push("/"), 3000);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setMessage(err.message);
        } else {
          setMessage("Verification failed");
        }
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
