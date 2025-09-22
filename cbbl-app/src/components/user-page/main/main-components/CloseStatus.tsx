import Image from "next/image";

type StoreStatusProps = {
  status: "closed";
};

function CloseStatus({ status }: StoreStatusProps) {
  const statusColorMap: Record<typeof status, string> = {
    closed: "bg-gray-100 text-gray-800",
  };

  const statusTextMap: Record<typeof status, string> = {
    closed: "Our store is currently closed. Please visit us later.",
  };

  return (
    <section className="max-w-md mx-auto mt-10 p-8 bg-white shadow-sm rounded-3xl border border-gray-200 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-center">Store Status</h2>

      {/* Status Badge */}
      <span
        className={`px-6 py-3 rounded-full font-semibold text-lg mb-4 ${statusColorMap[status]}`}
      >
        {status.toUpperCase()}
      </span>

      {/* Logo */}
      <div className="mb-4">
        <Image
          src="/cbbl-logo.svg"
          alt="Coffee Beats Logo"
          width={130}
          height={130}
          className="rounded-full shadow-md"
        />
      </div>

      {/* Description */}
      <p className="mt-2 text-gray-700 text-center leading-relaxed text-base">
        {statusTextMap[status]}
      </p>
    </section>
  );
}

export default CloseStatus;
