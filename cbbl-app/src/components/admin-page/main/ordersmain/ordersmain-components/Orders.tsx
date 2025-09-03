"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

interface Order {
  id: string;
  customer: string;
  amount: string;
  table: number;
  hour: string; // e.g. "7 PM"
  date: string;
  status: string;
}

interface OrdersProps {
  searchInput: string;
}

function Orders({ searchInput }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD001",
      customer: "Customer A",
      amount: "$100",
      table: 2,
      hour: "7 PM",
      date: "Aug 24 2025",
      status: "Pending",
    },
    {
      id: "ORD002",
      customer: "Customer B",
      amount: "$200",
      table: 4,
      hour: "8 PM",
      date: "Aug 24 2025",
      status: "Confirmed",
    },
    {
      id: "ORD003",
      customer: "Customer C",
      amount: "$150",
      table: 3,
      hour: "6 PM",
      date: "Aug 24 2025",
      status: "Preparing",
    },
    {
      id: "ORD004",
      customer: "Customer D",
      amount: "$120",
      table: 2,
      hour: "5 PM",
      date: "Aug 24 2025",
      status: "Ready",
    },
    {
      id: "ORD005",
      customer: "Customer E",
      amount: "$250",
      table: 5,
      hour: "9 PM",
      date: "Aug 24 2025",
      status: "Completed",
    },
  ]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Order;
    direction: "asc" | "desc";
  } | null>(null);

  // 🔽 For dropdown button filter
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false);

  const options: string[] = [
    "Pending",
    "Confirmed",
    "Preparing",
    "Ready",
    "Completed",
  ];

  const getRowColor = (status: string): string => {
    switch (status) {
      case "Pending":
        return "bg-yellow-50";
      case "Confirmed":
        return "bg-blue-50";
      case "Preparing":
        return "bg-purple-50";
      case "Ready":
        return "bg-indigo-50";
      case "Completed":
        return "bg-green-50";
      default:
        return "bg-white";
    }
  };

  const handleStatusChange = (index: number, newStatus: string) => {
    const updatedOrders = [...orders];
    updatedOrders[index].status = newStatus;
    setOrders(updatedOrders);
    setOpenIndex(null);
  };

  const parseHour = (hour: string): number => {
    const [time, meridian] = hour.split(" ");
    let h = parseInt(time);
    if (meridian === "PM" && h !== 12) h += 12;
    if (meridian === "AM" && h === 12) h = 0;
    return h;
  };

  const sortedOrders = [...orders];
  if (sortConfig) {
    sortedOrders.sort((a, b) => {
      let aVal: string | number = a[sortConfig.key];
      let bVal: string | number = b[sortConfig.key];
      if (sortConfig.key === "hour") {
        aVal = parseHour(a.hour);
        bVal = parseHour(b.hour);
      }
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const filteredOrders = sortedOrders.filter((order) => {
    const query = searchInput.toLowerCase();
    const matchesSearch =
      order.id.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.amount.toLowerCase().includes(query) ||
      order.table.toString().includes(query) ||
      order.hour.toLowerCase().includes(query) ||
      order.date.toLowerCase().includes(query) ||
      order.status.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSort = (key: keyof Order) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Order) => {
    if (!sortConfig || sortConfig.key !== key) return faSort;
    return sortConfig.direction === "asc" ? faSortUp : faSortDown;
  };

  return (
    <section className="products-card">
      <div className="flex justify-between">
        <h1 className="text-2xl mb-4">Manage Orders</h1>

        {/* 🔽 Dropdown Button Filter */}
        <div className="mb-4">
          <div className="relative inline-block">
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
                {options.map((status) => (
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
      </div>

      {/* 🔽 Table */}
      <div>
        <table className="w-full text-center border-separate border-spacing-y-2 mt-4 bg-white p-4 rounded-xl shadow-sm">
          <thead>
            <tr>
              <th
                className="dashboard-customer-th-style cursor-pointer"
                onClick={() => handleSort("id")}
              >
                Order ID{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("id")}
                  className="ml-1 text-sm"
                />
              </th>
              <th
                className="dashboard-customer-th-style cursor-pointer"
                onClick={() => handleSort("customer")}
              >
                Customer Name{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("customer")}
                  className="ml-1 text-sm"
                />
              </th>
              <th
                className="dashboard-customer-th-style cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                Amount{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("amount")}
                  className="ml-1 text-sm"
                />
              </th>
              <th
                className="dashboard-customer-th-style cursor-pointer"
                onClick={() => handleSort("hour")}
              >
                Reservation Details{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("hour")}
                  className="ml-1 text-sm"
                />
              </th>
              <th
                className="dashboard-customer-th-style cursor-pointer"
                onClick={() => handleSort("date")}
              >
                Order Date{" "}
                <FontAwesomeIcon
                  icon={getSortIcon("date")}
                  className="ml-1 text-sm"
                />
              </th>
              <th className="dashboard-customer-th-style">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order, index) => (
                <tr key={order.id} className={getRowColor(order.status)}>
                  <td className="dashboard-customer-td-style rounded-l-2xl">
                    {order.id}
                  </td>
                  <td className="dashboard-customer-td-style">
                    <Link href="/customers">{order.customer}</Link>
                  </td>
                  <td className="dashboard-customer-td-style">
                    {order.amount}
                  </td>
                  <td className="dashboard-customer-td-style">
                    Table for {order.table}, {order.hour}
                  </td>
                  <td className="dashboard-customer-td-style">{order.date}</td>
                  <td className="dashboard-customer-td-style rounded-r-2xl relative overflow-visible">
                    <div className="w-34 relative inline-block">
                      <button
                        className="flex w-full justify-between items-center border border-gray-200 rounded-lg px-4 py-2 bg-white shadow cursor-pointer"
                        onClick={() =>
                          setOpenIndex(openIndex === index ? null : index)
                        }
                      >
                        {order.status}
                        <FontAwesomeIcon icon={faAngleDown} className="ml-2" />
                      </button>
                      {openIndex === index && (
                        <ul className="absolute mt-1 text-left w-full bg-white border border-gray-200 rounded-lg shadow-sm z-10 overflow-visible">
                          {options.map((option) => (
                            <li
                              key={option}
                              onClick={() => handleStatusChange(index, option)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {option}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </td>
                </tr>
              ))
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
    </section>
  );
}

export default Orders;
