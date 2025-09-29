import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function getActiveOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: {
      userId,
      status: { in: ["Pending", "Confirmed", "Preparing", "Ready"] }, // ✅ include multiple statuses
    },
    include: {
      items: {
        include: { product: true },
      },
      seat: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function ActiveOrders() {
  const session = await getServerSession(authOptions);
  if (!session) return <p>Please log in to see your active orders.</p>;

  const userId = session.user.id;
  const orders = await getActiveOrdersForUser(userId);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Active Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">You have no active orders.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/home/orders/order-details?id=${order.id}`}
              className="bg-white rounded-xl overflow-hidden p-4 shadow-sm flex flex-col gap-4 hover:bg-gray-50"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <div>
                  <h2 className="text-lg font-semibold">Your Order</h2>
                  <p className="text-sm">
                    Seat: {order.seat ? order.seat.name : "None"}
                  </p>
                  <p className="text-sm">
                    Total: ₱{" "}
                    {order.items
                      .reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                      )
                      .toFixed(2)}
                  </p>
                </div>
                <p className="text-xs">
                  {new Date(order.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </p>
              </div>

              {/* Order Items */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-28">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-t-xl"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col p-3 gap-1">
                      <h3 className="text-sm font-semibold text-gray-800">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        ₱ {item.price.toFixed(2)} x {item.quantity}
                        {item.size ? ` (${item.size})` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
