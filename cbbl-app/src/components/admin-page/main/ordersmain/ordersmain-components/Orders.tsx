"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";

function Orders() {
  const [orders, setOrders] = useState([
    {
      id: "ORD001", customer: "Customer A", amount: "$100", reservation: "Table for 2, 7 PM", date: "Aug 24 2025", status: "Pending"
    },
    {
      id: "ORD002", customer: "Customer B", amount: "$200", reservation: "Table for 4, 8 PM", date: "Aug 24 2025", status: "Confirmed"
    },
    {
      id: "ORD003", customer: "Customer C", amount: "$150", reservation: "Table for 3, 6 PM", date: "Aug 24 2025", status: "Preparing"
    },
    {
      id: "ORD004", customer: "Customer D", amount: "$120", reservation: "Table for 2, 5 PM", date: "Aug 24 2025", status: "Ready"
    },
    {
      id: "ORD005", customer: "Customer E", amount: "$250", reservation: "Table for 5, 9 PM", date: "Aug 24 2025", status: "Completed"
    },
  ]);

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const options = ["Pending", "Confirmed", "Preparing", "Ready", "Completed"];

  const getRowColor = (status: string) => {
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

  return (
    <section className="dashboard-card">
      <h1 className="text-2xl mb-4">Manage Orders</h1>
      <div>
        <input type="text" placeholder="Search..." className="input-style" />
        <table className="w-full text-center border-separate border-spacing-y-2 mt-4">
          <thead>
            <tr>
              <th className="dashboard-customer-th-style">Order ID</th>
              <th className="dashboard-customer-th-style">Customer Name</th>
              <th className="dashboard-customer-th-style">Amount</th>
              <th className="dashboard-customer-th-style">
                Reservation Details
              </th>
              <th className="dashboard-customer-th-style">Order Date</th>
              <th className="dashboard-customer-th-style">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order.id} className={`${getRowColor(order.status)}`}>
                <td className="dashboard-customer-td-style rounded-l-2xl">{order.id}</td>
                <td className="dashboard-customer-td-style">
                  <Link href="/customers">{order.customer}</Link>
                </td>
                <td className="dashboard-customer-td-style">{order.amount}</td>
                <td className="dashboard-customer-td-style">
                  {order.reservation}
                </td>
                <td className="dashboard-customer-td-style">{order.date}</td>
                <td className="dashboard-customer-td-style rounded-r-2xl">
                  <div className="w-34 relative inline-block">
                    <button
                      className="flex w-full justify-between items-center border-1 border-gray-200 rounded-lg px-4 py-2 bg-white shadow cursor-pointer"
                      onClick={() =>
                        setOpenIndex(openIndex === index ? null : index)
                      }
                    >
                      {order.status}
                      <FontAwesomeIcon icon={faAngleDown} className="ml-2" />
                    </button>
                    {openIndex === index && (
                      <ul className="absolute mt-1 w-full bg-white border-1 border-gray-200 rounded-lg shadow-sm z-10 overflow-hidden">
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
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default Orders;
