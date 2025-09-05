import ActiveOrders from "./ActiveOrders";
import PastOrders from "./PastOrders";

function SectionOne() {
  return (
    <div className="pt-25 pb-10 flex flex-col gap-20">
      <ActiveOrders />
      <PastOrders />
    </div>
  );
}
export default SectionOne;
