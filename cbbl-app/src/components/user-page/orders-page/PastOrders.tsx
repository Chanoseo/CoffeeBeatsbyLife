import ReorderButton from "./ReorderButton";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

async function getPastOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { status: "Completed", userId }, // fetch only completed orders
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PastOrders() {
  const session = await getServerSession(authOptions);
  if (!session) return <p>Please log in to see your past orders.</p>;

  const userId = session.user.id;
  const orders = await getPastOrdersForUser(userId);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Past Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no past orders.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden p-4 flex flex-col gap-4 text-brown"
            >
              {/* Order Header */}
              <div className="flex justify-between items-center border-b pb-2 mb-2">
                <div>
                  <h2 className="text-lg font-semibold">Order</h2>
                  <p className="text-sm">
                    Status: {order.status}
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
                  {new Date(order.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Order Items */}
              <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-2">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={200}
                      height={200}
                      className="w-full h-28 object-cover rounded"
                    />
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold">
                        {item.product.name}
                      </h3>
                      <p className="text-xs line-clamp-2">
                        {item.product.description}
                      </p>
                      <p className="text-sm mt-1">
                        ₱ {item.price.toFixed(2)} x {item.quantity}
                        <span className="ml-1">({item.size})</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reorder Button */}
              <div className="mt-2 flex justify-end">
                <ReorderButton orderId={order.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
