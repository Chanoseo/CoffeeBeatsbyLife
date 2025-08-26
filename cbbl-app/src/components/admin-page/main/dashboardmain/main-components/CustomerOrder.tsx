import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

function CustomerOrder() {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card-title">
        <h1>Customer Order</h1>
        <FontAwesomeIcon icon={faShoppingCart} />
      </div>
      <div className="h-74 overflow-auto">
        <table className="w-full text-center border-separate border-spacing-y-2">
          <thead>
            <tr>
              <th className="dashboard-customer-th-style">Order ID</th>
              <th className="dashboard-customer-th-style">Customer Name</th>
              <th className="dashboard-customer-th-style">Amount</th>
              <th className="dashboard-customer-th-style">Reservation Details</th>
              <th className="dashboard-customer-th-style">Order Date</th>
              <th className="dashboard-customer-th-style">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-yellow-50">
              <td className="dashboard-customer-td-style rounded-l-2xl">
                <Link href="/customer">ORD001</Link>
              </td>
              <td className="dashboard-customer-td-style">
                <Link href="/customer">Customer A</Link>
              </td>
              <td className="dashboard-customer-td-style">
                <Link href="/customer">$100</Link>
              </td>
              <td className="dashboard-customer-td-style">
                <Link href="/customer">Table for 2, 7 PM</Link>
              </td>
              <td className="dashboard-customer-td-style">
                <Link href="/customer">Aug 24 2025</Link>
              </td>
              <td className="dashboard-customer-td-style rounded-r-2xl">
                <Link href="/customer">Pending</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default CustomerOrder;
