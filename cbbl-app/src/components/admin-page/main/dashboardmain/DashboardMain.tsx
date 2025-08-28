import CustomerOrder from "./main-components/CustomerOrder";
import SalesDynamics from "./main-components/SalesDynamics";
import PeakHoursAnalytics from "./main-components/PeakHoursAnalytics";
import ReservationTrends from "./main-components/ReservationTrends";
import DashboardHeader from "./main-components/DashboardHeader";
import KeyMetrics from "./main-components/KeyMetrics";

function DashboardMain() {
  return (
    <main className="lg:py-15 lg:px-10 xl:py-15 xl:px-20 bg-[#3C604C]/10 w-full h-screen overflow-auto py-10 px-4 text-brown">
      <DashboardHeader />
      <KeyMetrics />
      <SalesDynamics />
      <PeakHoursAnalytics />
      <ReservationTrends />
      <CustomerOrder />
    </main>
  );
}
export default DashboardMain;
