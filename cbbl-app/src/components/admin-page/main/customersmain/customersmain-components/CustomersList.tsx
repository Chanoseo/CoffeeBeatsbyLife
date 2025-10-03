"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ViewCustomer from "./ViewCustomer";

type Customer = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

interface CustomersListProps {
  searchInput: string; // ✅ add prop
}

export default function CustomersList({ searchInput }: CustomersListProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");

        const data: Customer[] = await res.json();
        setCustomers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  if (loading)
    return (
      <p className="text-center text-gray-500 mt-10">Loading customers...</p>
    );
  if (!customers.length)
    return (
      <p className="text-center text-gray-500 mt-10">No customers found.</p>
    );

  // ✅ filter customers by name or email
  const filteredCustomers = customers.filter((c) => {
    if (!searchInput) return true; // show all if empty
    const term = searchInput.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term)
    );
  });

  return (
    <section className="p-4">
      {filteredCustomers.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          No matching customers.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col items-center gap-3 cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              {customer.image ? (
                <Image
                  src={customer.image}
                  alt={customer.name ?? "User"}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#3C604C]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[#3C604C]/10 flex items-center justify-center text-[#3C604C] font-bold text-xl border-2 border-[#3C604C]">
                  {customer.name ? customer.name[0] : "U"}
                </div>
              )}
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-center truncate w-full">
                {customer.name ?? "No Name"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center truncate w-full">
                {customer.email ?? "No Email"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedCustomer && (
        <ViewCustomer
          user={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </section>
  );
}
