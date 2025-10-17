"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  size?: string;
  product: Product;
}

interface Seat {
  id: string;
  name: string;
}

interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  seat: Seat | null;
}

function Order() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/profile/active");
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchOrders();
  }, []);

  if (orders.length === 0) return null; // ✅ nothing shows if no orders

  return (
    <div className="mt-4 bg-gray-50 p-4 rounded">
      <h1 className="text-2xl font-semibold mb-4">Active Orders</h1>
      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/home/orders/order-details?id=${order.id}`}
            className="bg-white rounded-xl overflow-hidden p-4 flex flex-col gap-4 hover:bg-white"
          >
            {/* Order Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-2 mb-2">
              <div>
                <h2 className="text-lg font-semibold">Your Order</h2>
                <p className="text-sm">
                  Seat: {order.seat ? order.seat.name : "None"}
                </p>
                <p className="text-sm">
                  Total: ₱{" "}
                  {order.items
                    .reduce((sum, item) => sum + item.price * item.quantity, 0)
                    .toFixed(2)}
                </p>
              </div>
              <p className="text-xs">
                {new Date(order.createdAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>

            {/* Order Items */}
            <div className="overflow-x-auto md:overflow-x-visible scrollbar-hide">
              <div className="flex gap-4 md:grid md:grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] md:gap-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex-shrink-0 ${
                      order.items.length === 1 ? "w-full" : "w-40"
                    } md:w-auto flex flex-col gap-2 bg-white rounded-xl border border-gray-200 overflow-hidden`}
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-28 bg-gray-200">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        sizes="250px"
                        className="object-cover rounded-t-xl"
                        priority
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col p-3 gap-1">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        ₱ {item.price.toFixed(2)} x {item.quantity}
                        {item.size ? ` (${item.size})` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Order;
