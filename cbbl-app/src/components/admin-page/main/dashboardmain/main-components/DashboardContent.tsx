import CustomerOrder from "./CustomerOrder";
import KeyMetrics from "./KeyMetrics";
import PeakHoursAnalytics from "./PeakHoursAnalytics";
import ReservationTrends from "./ReservationTrends";
import SalesDynamics from "./SalesDynamics";

function DashboardContent() {
  return (
    <section className="products-card">
      <KeyMetrics />
      <SalesDynamics />
      <PeakHoursAnalytics />
      <ReservationTrends />
      <CustomerOrder />
    </section>
  );
}
export default DashboardContent;
