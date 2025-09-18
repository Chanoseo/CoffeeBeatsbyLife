import { Suspense } from "react";
import VerifyEmailContent from "@/components/VerifyEmailContent";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="text-center text-lg">Loading...</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
