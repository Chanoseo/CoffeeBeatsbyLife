"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import UpdateUser from "./UpdateUser";

interface User {
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
}

export default function Users({ searchInput }: { searchInput: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/users/all")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading)
    return <p className="text-center text-gray-500 mt-10">Loading users...</p>;

  // ✅ normalize search input
  const query = searchInput?.toLowerCase().trim() || "";

  // ✅ filter safely (avoid null issues)
  const filteredUsers = users.filter((user) => {
    const name = user.name?.toLowerCase() || "";
    const email = user.email?.toLowerCase() || "";
    return name.includes(query) || email.includes(query);
  });

  if (!filteredUsers.length)
    return <p className="text-center text-gray-500 mt-10">No users found.</p>;

  return (
    <section className="p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredUsers.map((user) => (
          <div
            key={user.email}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col items-center gap-3 cursor-pointer"
            onClick={() => setSelectedUser(user)}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#3C604C]"
              />
            ) : (
              <Image
                src="/profile-default.png"
                alt={user.name || "User"}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#3C604C]"
              />
            )}
            <p className="font-semibold text-gray-800 dark:text-gray-100 text-center truncate w-full">
              {user.name || "No Name"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center truncate w-full">
              {user.email}
            </p>
            <span className="text-xs px-2 py-1 bg-[#3C604C]/10 rounded-full">
              {user.role.toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* ✅ show modal if a user is selected */}
      {selectedUser && (
        <UpdateUser
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDelete={() => {
            setUsers((prev) =>
              prev.filter((u) => u.email !== selectedUser.email)
            );
          }}
        />
      )}
    </section>
  );
}
