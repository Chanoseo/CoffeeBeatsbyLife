import ReorderButton from "./ReorderButton";
import Image from "next/image";

function PastOrders() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Past Orders</h1>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-4">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>

        <div className="bg-white rounded-xl overflow-hidden shadow-sm shadow-black/20 flex flex-col">
          <Image
            src="/cbbl-image.jpg"
            alt="A beautiful scenery"
            width={200}
            height={200}
            className="w-full h-36 object-cover"
          />
          <div className="p-3 flex flex-col gap-3 text-left">
            <div>
              <h1 className="text-lg font-semibold">Hazelnut Brew</h1>
              <p className="text-xs mt-1">
                A smooth, aromatic blend infused with roasted hazelnuts and a
                hint of vanilla. Perfect for cozy mornings or a midday
                pick-me-up.
              </p>
              <p className="mt-2 underline text-xl">₱ 12.24</p>
            </div>
            <ReorderButton />
          </div>
        </div>
      </div>
    </div>
  );
}
export default PastOrders;
