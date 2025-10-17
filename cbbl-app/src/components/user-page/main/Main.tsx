"use client";

import { useEffect, useState } from "react";
import SectionOne from "./main-components/SectionOne";
import CloseStatus from "./main-components/CloseStatus";

type StoreStatusType = "open" | "closed" | "busy";

function UserPageMain() {
  const [storeStatus, setStoreStatus] = useState<StoreStatusType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) throw new Error("Failed to fetch store status");
        const data = await res.json();

        // Accept "open", "closed", or "busy"
        if (
          data.storeStatus === "open" ||
          data.storeStatus === "closed" ||
          data.storeStatus === "busy"
        ) {
          setStoreStatus(data.storeStatus);
        }
      } catch (err) {
        console.error("Failed to fetch store status", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <main className="px-4 md:px-10 lg:px-40 text-brown">
      {/* Open or busy -> show SectionOne */}
      {(storeStatus === "open" || storeStatus === "busy") && <SectionOne />}

      {/* Closed -> show CloseStatus */}
      {storeStatus === "closed" && <CloseStatus status={storeStatus} />}

      {!storeStatus && !loading && (
        <div className="text-center text-gray-500">No status available</div>
      )}
    </main>
  );
}

export default UserPageMain;
