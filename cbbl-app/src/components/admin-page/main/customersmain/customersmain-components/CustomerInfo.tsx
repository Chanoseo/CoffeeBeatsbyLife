"use client";
import Image from "next/image";
import React, { useState } from "react";

type ProductItem = {
  name: string;
  price: number;
  imageUrl: string;
};

type OrderItem = {
  quantity: number;
  product: ProductItem;
};

type Order = {
  id: string;
  status: string;
  seat?: { name: string } | null;
  guest?: number;
  items: OrderItem[];
  totalAmount?: number;
  startTime?: string | Date;
  endTime?: string | Date;
};

type Customer = {
  id?: string;
  name: string | null;
  email: string | null;
  image: string | null;
  orders?: Order[];
};

interface CustomerInfoProps {
  user: Customer;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  Preparing: "bg-purple-100 text-purple-700 border-purple-200",
  Ready: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
};

export default function CustomerInfo({ user }: CustomerInfoProps) {
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState("");

  const filteredOrders = user.orders?.filter(
    (order) => order.status !== "Completed"
  );

  const formatDate = (date?: string | Date) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString([], { dateStyle: "short" });
  };

  const formatTime = (date?: string | Date) => {
    if (!date) return "N/A";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    try {
      const res = await fetch("/api/customers/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: user.email, // send to the user's email
          subject: `Message from Coffee Beats`,
          message,
          recipientName: user.name, // pass the name from your user object
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Message sent successfully!");
        setMessage("");
        setShowMessageInput(false);
      } else {
        alert(data.error || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending the message.");
    }
  };

  // Calculate the most purchased product for this user
  const getMostPurchasedProduct = () => {
    if (!user.orders || user.orders.length === 0) return null;

    const productCount: Record<
      string,
      { product: ProductItem; quantity: number }
    > = {};

    user.orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.product.name; // unique per product
        if (productCount[key]) {
          productCount[key].quantity += item.quantity; // sum total quantity
        } else {
          productCount[key] = {
            product: item.product,
            quantity: item.quantity,
          };
        }
      });
    });

    // Get the product with the highest total quantity
    const mostPurchased = Object.values(productCount).sort(
      (a, b) => b.quantity - a.quantity
    )[0];

    return mostPurchased;
  };

  const topProduct = getMostPurchasedProduct();

  // Total Orders (all, including completed)
  const totalUserOrders = user.orders?.length ?? 0;

  // Total Spent (sum of all orders, including completed)
  const totalSpent =
    user.orders?.reduce((sum, order) => {
      const orderTotal = order.items.reduce(
        (itemSum, item) => itemSum + item.quantity * item.product.price,
        0
      );
      return sum + orderTotal;
    }, 0) ?? 0;

  return (
    <div>
      {/* Profile Image */}
      {user.image ? (
        <Image
          src={user.image}
          alt={user.name || "User"}
          width={100}
          height={100}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      ) : (
        <Image
          src="/profile-default.png"
          alt={user.name || "User"}
          width={100}
          height={100}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
        />
      )}

      {/* User Info */}
      <h2 className="text-lg font-semibold text-center mb-2 text-gray-800 dark:text-gray-100">
        {user.name || "No Name"}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
        {user.email || "No Email"}
      </p>

      {/* Message Button */}
      <div className="flex justify-center mb-4">
        <button
          className="button-style"
          onClick={() => setShowMessageInput((prev) => !prev)}
        >
          {showMessageInput ? "Cancel" : "Message"}
        </button>
      </div>

      {/* Message Input */}
      {showMessageInput && (
        <div className="flex flex-col w-full max-w-md mx-auto mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message..."
            className="w-full h-32 px-4 py-3 rounded-2xl border border-gray-300 text-gray-900 resize-none focus:outline-none"
          />
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSendMessage}
              className="button-style px-5 py-2 rounded-full"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Total Orders Made & Total Spent */}
      <div className="mb-4 p-4 rounded-xl flex items-center justify-between max-w-md mx-auto border border-gray-200">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Total Orders Made
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total Spent: ₱{totalSpent.toFixed(2)}
          </p>
        </div>
        <span className="bg-[#3C604C] text-white text-xs px-3 py-1 rounded-full">
          {totalUserOrders}
        </span>
      </div>

      {/* Most Purchased Product */}
      {topProduct && (
        <div className="mb-6 p-4 bg-white rounded-xl flex items-center gap-4 border border-gray-200 max-w-md mx-auto">
          <Image
            src={topProduct.product.imageUrl}
            alt={topProduct.product.name}
            width={60}
            height={60}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              Most Purchased Product
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {topProduct.product.name}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="bg-[#3C604C] text-white text-xs px-2.5 py-1 rounded-full">
                Total: {topProduct.quantity}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ₱{topProduct.product.price.toFixed(2)} each
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Current Orders */}
      <div className="text-left">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Current Orders
        </h3>
        {filteredOrders && filteredOrders.length > 0 ? (
          <ul className="space-y-4">
            {filteredOrders.map((order) => {
              const orderTotal = order.items.reduce(
                (sum, item) => sum + item.quantity * item.product.price,
                0
              );

              const badgeClass =
                statusStyles[order.status] ||
                "bg-gray-100 text-gray-700 border-gray-200";

              return (
                <li
                  key={order.id}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 space-y-3 border border-gray-200 dark:border-gray-700"
                >
                  {/* Order Header */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full border ${badgeClass}`}
                    >
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      ₱{orderTotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Seat & Guests */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Seat: {order.seat?.name ?? "N/A"} | Guests:{" "}
                    {order.guest ?? 1}
                  </p>

                  {/* Date & Time */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Date: {formatDate(order.startTime)} <br />
                    Time: {formatTime(order.startTime)} -{" "}
                    {formatTime(order.endTime)}
                  </p>

                  {/* Items */}
                  <div className="">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 mt-2"
                      >
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          width={50}
                          height={50}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          ₱{(item.quantity * item.product.price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No current orders.
          </p>
        )}
      </div>
    </div>
  );
}
