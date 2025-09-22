"use client";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import CustomerInfo from "./CustomerInfo";

type Customer = {
  id?: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

interface ViewCustomerProps {
  user: Customer;
  onClose: () => void;
}

export default function ViewCustomer({ user, onClose }: ViewCustomerProps) {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed left-0 top-0 w-full h-full z-50 flex justify-end bg-black/10"
      onClick={handleBackdropClick}
    >
      <div className="w-full md:w-1/3 bg-white p-6 shadow-lg overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl">Customer Information</h2>
          <FontAwesomeIcon
            icon={faX}
            onClick={onClose}
            className="text-xl cursor-pointer"
          />
        </div>
        <CustomerInfo user={user} />
      </div>
    </div>
  );
}
