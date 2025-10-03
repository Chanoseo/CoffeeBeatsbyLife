"use client";

import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faSortUp,
  faSortDown,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import OrdersModal from "./OrdersModal";

interface OrdersProps {
  searchInput: string;
}

export interface OrderItem {
  id: string;
  product: { name: string };
  quantity: number;
  price: number;
  size?: string; // ✅ add size
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
  id: string; // DB id
  displayId?: string; // formatted ID for UI
  user?: { name?: string | null };
  totalAmount: number;
  seat?: string | null;
  time?: string | null;
  status: string;
  items?: OrderItem[]; // ✅ items now include size
  paymentProof?: string;
  createdAt: string;
  updatedAt: string;
  feedbacks?: Feedback[];
}

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
];

function Orders({ searchInput }: OrdersProps) {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof FullOrder;
    direction: "asc" | "desc";
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<FullOrder | null>(null);

  useEffect(() => {
    let isMounted = true; // prevent state update if component unmounts

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data: FullOrder[] = await res.json();

        if (!isMounted) return;

        // Exclude completed orders and keep displayId logic
        const filteredOrders = data
          .filter((order) => order.status !== "Completed")
          .map((order, index) => ({
            ...order,
            displayId: `ORD${(index + 1).toString().padStart(3, "0")}`,
          }));

        setOrders(filteredOrders);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    fetchOrders(); // initial fetch

    const interval = setInterval(fetchOrders, 3000); // fetch every 3 seconds

    return () => {
      isMounted = false;
      clearInterval(interval); // cleanup on unmount
    };
  }, []);

  const getRowColor = (status: string) =>
    ({
      Pending: "bg-yellow-50",
      Confirmed: "bg-blue-50",
      Preparing: "bg-purple-50",
      Ready: "bg-indigo-50",
      Completed: "bg-green-50",
    }[status] || "bg-white");

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
        case "seat":
          aVal = a.seat ?? "";
          bVal = b.seat ?? "";
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

  const filteredOrders = useMemo(() => {
    const query = searchInput.toLowerCase();
    return sortedOrders.filter((order) => {
      const matchesSearch = [
        order.displayId ?? "",
        order.user?.name ?? "",
        `₱${order.totalAmount.toFixed(2)}`,
        order.seat ?? "",
        order.time
          ? new Date(order.time).toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })
          : "",
        order.time ? new Date(order.time).toLocaleDateString() : "",
        order.status,
      ].some((field) => field.toLowerCase().includes(query));
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sortedOrders, searchInput, statusFilter]);

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
      <div className="flex justify-between">
        <h1 className="text-2xl mb-4">Manage Orders</h1>
        <div className="mb-4 relative inline-block">
          <button
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 bg-white shadow cursor-pointer"
          >
            {statusFilter === "All"
              ? "Filter by Status"
              : `Status: ${statusFilter}`}
            <FontAwesomeIcon icon={faAngleDown} />
          </button>
          {filterDropdownOpen && (
            <ul className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-sm z-10 overflow-hidden">
              <li
                onClick={() => {
                  setStatusFilter("All");
                  setFilterDropdownOpen(false);
                }}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                All
              </li>
              {STATUS_OPTIONS.map((status) => (
                <li
                  key={status}
                  onClick={() => {
                    setStatusFilter(status);
                    setFilterDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {status}
                </li>
              ))}
            </ul>
          )}
        </div>
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
              Reservation Details{" "}
              <FontAwesomeIcon
                icon={getSortIcon("time")}
                className="ml-1 text-sm"
              />
            </th>
            <th
              className="dashboard-customer-th-style cursor-pointer"
              onClick={() => handleSort("createdAt")}
            >
              Order Date{" "}
              <FontAwesomeIcon
                icon={getSortIcon("createdAt")}
                className="ml-1 text-sm"
              />
            </th>
            <th className="dashboard-customer-th-style">Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={6} className="py-6 text-gray-500">
                Loading orders...
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
                  <td className="dashboard-customer-td-style">
                    {order.seat || "-"}
                    {timeStr !== "-" ? `, ${timeStr}` : ""}
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

export default Orders;
