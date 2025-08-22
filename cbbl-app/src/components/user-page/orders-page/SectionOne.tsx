import ActiveOrders from "./ActiveOrders";
import PastOrders from "./PastOrders";

function SectionOne() {
  return (
    <section className="pt-25 pb-10 flex flex-col gap-20">
      <ActiveOrders />
      <PastOrders />
    </section>
  );
}
export default SectionOne;
