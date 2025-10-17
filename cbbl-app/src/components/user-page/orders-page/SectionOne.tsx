import ActiveOrders from "./ActiveOrders";
import PastOrders from "./PastOrders";

function SectionOne() {
  return (
    <div className="pt-10 lg:pt-25 lg:pb-10 flex flex-col gap-20">
      <ActiveOrders />
      <PastOrders />
    </div>
  );
}
export default SectionOne;
