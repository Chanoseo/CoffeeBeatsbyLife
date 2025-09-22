// Customers.tsx
import { useState } from "react";
import NotifyForm from "./NotifyForm";
import CustomersList from "./CustomersList";

interface CustomersProps {
  searchInput: string; // ✅ Accept prop
}

function Customers({ searchInput }: CustomersProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="products-card">
      <div className="text-end">
        <button onClick={() => setShowForm(true)} className="button-style">
          Notify Customers
        </button>
      </div>
      <CustomersList searchInput={searchInput} />{" "}
      {/* ✅ Pass to CustomersList */}
      {showForm && <NotifyForm onClose={() => setShowForm(false)} />}
    </section>
  );
}

export default Customers;
