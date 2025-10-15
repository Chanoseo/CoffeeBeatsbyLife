"use client";

import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSortUp,
  faSortDown,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import OrdersModal from "./OrdersModal";

export interface OrderItem {
  id: string;
  product: { name: string; imageUrl?: string };
  quantity: number;
  price: number;
  size?: string;
}

export interface Feedback {
  id: string;
  user?: { name?: string | null };
  overallReview?: string | null;
  appExperience: number;
  orderCompleteness: number;
  speedOfService: number;
  valueForMoney: number;
  reservationExperience: number;
  overallSatisfaction: number;
}

export interface FullOrder {
  id: string;
  displayId?: string;
  user?: { name?: string | null };
  totalAmount: number;
  seats?: string | null;
  time?: string | null;
  status: string;
  guest: number;
  startTime: string;
  endTime: string;
  items?: OrderItem[];
  paymentProof?: string;
  createdAt: string;
  updatedAt: string;
  feedbacks?: Feedback[]; // ✅ Add this
}

interface PastOrdersProps {
  searchInput: string;
}

function PastOrders({ searchInput }: PastOrdersProps) {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FullOrder;
    direction: "asc" | "desc";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<FullOrder | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data: FullOrder[] = await res.json();

        // Only completed orders
        const completedOrders = data
          .filter((order) => order.status === "Completed")
          .map((order, index) => ({
            ...order,
            displayId: `ORD${(index + 1).toString().padStart(3, "0")}`,
          }));

        setOrders(completedOrders);
      } catch (err) {
        console.error("Failed to fetch past orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getRowColor = (status: string) =>
    status === "Completed" ? "bg-green-50" : "bg-white";

  const sortedOrders = useMemo(() => {
    if (!sortConfig) return orders;
    return [...orders].sort((a, b) => {
      let aVal: number | string = "";
      let bVal: number | string = "";

      switch (sortConfig.key) {
        case "time":
          aVal = a.time ? new Date(a.time).getTime() : -1;
          bVal = b.time ? new Date(b.time).getTime() : -1;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "seats":
          aVal = a.seats ?? "";
          bVal = b.seats ?? "";
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          if (sortConfig.key === "displayId") {
            aVal = a.displayId ?? "";
            bVal = b.displayId ?? "";
          } else if (sortConfig.key === "user") {
            aVal = a.user?.name ?? "";
            bVal = b.user?.name ?? "";
          } else if (sortConfig.key === "totalAmount") {
            aVal = a.totalAmount;
            bVal = b.totalAmount;
          }
          break;
      }

      return sortConfig.direction === "asc"
        ? aVal < bVal
          ? -1
          : aVal > bVal
          ? 1
          : 0
        : aVal > bVal
        ? -1
        : aVal < bVal
        ? 1
        : 0;
    });
  }, [orders, sortConfig]);

  // ✅ Filter orders by search input and selected date
  const filteredOrders = useMemo(() => {
    const query = searchInput.toLowerCase();

    return sortedOrders
      .filter((order) => {
        // Match date
        const orderDate = order.time
          ? new Date(order.time).toISOString().split("T")[0]
          : "";
        return orderDate === selectedDate; // Filter by selected date
      })
      .filter((order) =>
        [
          order.displayId ?? "",
          order.user?.name ?? "",
          `₱${order.totalAmount.toFixed(2)}`,
          order.seats ?? "",
          order.status,
        ].some((field) => field.toLowerCase().includes(query))
      );
  }, [sortedOrders, searchInput, selectedDate]);

  const handleSort = (key: keyof FullOrder) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: keyof FullOrder) =>
    !sortConfig || sortConfig.key !== key
      ? faSort
      : sortConfig.direction === "asc"
      ? faSortUp
      : faSortDown;

  return (
    <section className="products-card">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl">Past Orders</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2 bg-white shadow cursor-pointer focus:outline-none"
        />
      </div>

      <table className="w-full text-center border-separate border-spacing-y-2 mt-4 bg-white p-4 rounded-xl shadow-sm">
        <thead>
          <tr>
            <th className="dashboard-customer-th-style">Order ID</th>
            <th className="dashboard-customer-th-style">Customer Name</th>
            <th className="dashboard-customer-th-style">Amount</th>
            <th
              className="dashboard-customer-th-style cursor-pointer"
              onClick={() => handleSort("time")}
            >
              Reservation Time{" "}
              <FontAwesomeIcon
                icon={getSortIcon("time")}
                className="ml-1 text-sm"
              />
            </th>
            <th className="dashboard-customer-th-style">Order Date</th>
            <th className="dashboard-customer-th-style">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-6 text-gray-500">
                Loading past orders...
              </td>
            </tr>
          ) : filteredOrders.length ? (
            filteredOrders.map((order) => {
              const timeStr = order.time
                ? new Date(order.time).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "-";
              const dateStr = order.time
                ? new Date(order.time).toLocaleDateString()
                : "-";
              return (
                <tr
                  key={order.id}
                  className={`${getRowColor(order.status)} cursor-pointer`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="dashboard-customer-td-style rounded-l-2xl">
                    {order.displayId}
                  </td>
                  <td className="dashboard-customer-td-style">
                    {order.user?.name || "Unknown"}
                  </td>
                  <td className="dashboard-customer-td-style">
                    ₱{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="dashboard-customer-td-style whitespace-nowrap overflow-hidden text-ellipsis">
                    {timeStr !== "-" ? timeStr : "-"}
                  </td>
                  <td className="dashboard-customer-td-style">{dateStr}</td>
                  <td className="dashboard-customer-td-style rounded-r-2xl">
                    {order.status}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-6 text-gray-500">
                No orders found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedOrder && (
        <OrdersModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}

export default PastOrders;
