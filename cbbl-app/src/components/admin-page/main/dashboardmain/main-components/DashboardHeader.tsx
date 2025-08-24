import Image from "next/image";

function DashboardHeader() {
  return (
    <section className="flex justify-between items-center bg-white shadow-sm rounded-xl p-6 flex-1">
      <h2 className="text-2xl font-semibold">Dashboard</h2>
      <div className="flex gap-4 items-center">
        <div className="relative w-10 h-10 rounded-full">
          <Image
            src="/cbbl-image.jpg"
            alt="Logo"
            fill
            sizes="50px"
            className="object-cover rounded-full"
          />
        </div>
        <span className="text-sm">Kristian Josef Banatlao</span>
      </div>
    </section>
  );
}

export default DashboardHeader;
