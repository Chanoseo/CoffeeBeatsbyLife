"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import ProfileModal from "./ProfileModal";

interface User {
  name: string | null;
  email: string | null;
  image: string | null;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();
        setUser(data);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading)
    return <div className="text-center py-20">Loading profile...</div>;
  if (!user) return <div className="text-center py-20">No profile found.</div>;

  return (
    <section className="w-full bg-[#f9fafb] rounded p-8">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-24 h-24 relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "User"}
              fill
              sizes="250px"
              className="rounded-full object-cover"
              priority
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-[#3C604C] flex items-center justify-center text-white text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase() ?? "U"}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{user.name ?? "Guest User"}</h2>
            <FontAwesomeIcon
              icon={faPen}
              className="text-gray-500 cursor-pointer hover:text-gray-700"
              title="Edit Profile"
              onClick={() => setIsModalOpen(true)}
            />
          </div>
          <p className="text-gray-600">{user.email ?? "No email provided"}</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <ProfileModal
          user={user}
          onClose={() => setIsModalOpen(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser); // Update parent state with new image, name, etc.
            setIsModalOpen(false); // optionally close modal after save
          }}
        />
      )}
    </section>
  );
}
