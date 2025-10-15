"use client";

import { useEffect, useState, useMemo } from "react";
import {
  faShoppingCart,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OrdersModal from "../../ordersmain/ordersmain-components/OrdersModal";

interface OrderItem {
  id: string;
  product: { name: string; imageUrl?: string };
  quantity: number;
  price: number;
  size?: string;
}

interface FullOrder {
  id: string;
  displayId?: string;
  user?: { name?: string | null };
  totalAmount: number;
  seat?: string | null;
  time?: string | null;
  status: "Pending" | "Confirmed" | "Preparing" | "Ready" | "Completed";
  guest: number;
  startTime: string;
  endTime: string;
  items?: OrderItem[];
  paymentProof?: string;
  createdAt: string;
  updatedAt: string;
}

type SortKey = "displayId" | "user" | "totalAmount" | "time" | "createdAt";

function CustomerOrder() {
  const [orders, setOrders] = useState<FullOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<FullOrder | null>(null);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data: FullOrder[] = await res.json();
        if (!isMounted) return;

        // Sort by creation date
        const sortedData = data.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        // Only assign displayId to non-completed orders
        let counter = 1;
        const mapped = sortedData.map((order) => {
          if (order.status !== "Completed") {
            const displayId = `ORD${counter.toString().padStart(3, "0")}`;
            counter++;
            return { ...order, displayId };
          }
          return order; // completed orders keep displayId undefined
        });

        setOrders(mapped);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getRowColor = (status: string) =>
    ({
      Pending: "bg-yellow-50",
      Confirmed: "bg-blue-50",
      Preparing: "bg-purple-50",
      Ready: "bg-indigo-50",
      Completed: "bg-green-50",
      Canceled: "bg-red-50",
    }[status] || "bg-white");

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key: SortKey) =>
    !sortConfig || sortConfig.key !== key
      ? faSort
      : sortConfig.direction === "asc"
      ? faSortUp
      : faSortDown;

  const sortedOrders = useMemo(() => {
    if (!sortConfig) return orders;
    return [...orders].sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      switch (sortConfig.key) {
        case "displayId":
          aVal = a.displayId ?? "";
          bVal = b.displayId ?? "";
          break;
        case "user":
          aVal = a.user?.name ?? "";
          bVal = b.user?.name ?? "";
          break;
        case "totalAmount":
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case "time":
          aVal = a.time ? new Date(a.time).getTime() : -1;
          bVal = b.time ? new Date(b.time).getTime() : -1;
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [orders, sortConfig]);

  const filteredOrders = useMemo(() => {
    const query = searchInput.toLowerCase();
    return sortedOrders.filter(
      (order) =>
        order.status !== "Completed" && // Exclude completed orders
        [
          order.seat ?? "",
          order.time
            ? new Date(order.time).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })
            : "",
          order.time ? new Date(order.time).toLocaleDateString() : "",
          new Date(order.createdAt).toLocaleDateString(), // Order date
        ].some((field) => field.toLowerCase().includes(query))
    );
  }, [sortedOrders, searchInput]);

  return (
    <section className="dashboard-card">
      <div className="dashboard-card-title">
        <h1 className="md:block hidden">Customer Order</h1>
        <FontAwesomeIcon icon={faShoppingCart} />
      </div>

      {/* Search */}
      <div className="flex justify-start mb-4 mt-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none placeholder-gray-400"
        />
      </div>

      {/* Orders Table */}
      <div className="h-74 overflow-auto">
        <table className="w-full text-center border-separate border-spacing-y-2">
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
      </div>

      {/* Modal */}
      {selectedOrder && (
        <OrdersModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </section>
  );
}

export default CustomerOrder;
