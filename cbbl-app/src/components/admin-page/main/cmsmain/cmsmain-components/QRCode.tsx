"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type CMSPayment = {
  qrCodeImage?: string;
  paymentNumber?: string;
  qrCodeMayaImage?: string;
  paymentMayaNumber?: string;
};

function QRCode() {
  const [method, setMethod] = useState<"GCash" | "Maya">("GCash");
  const [previewImages, setPreviewImages] = useState({
    GCash: "/gcash-qrcode.png",
    Maya: "/gcash-qrcode.png",
  });
  const [numbers, setNumbers] = useState({
    GCash: "9472612046",
    Maya: "09472612046",
  });
  const [files, setFiles] = useState<{ GCash?: File; Maya?: File }>({});

  useEffect(() => {
    async function loadPayment() {
      try {
        const res = await fetch("/api/cms");
        if (!res.ok) return;
        const data: CMSPayment = await res.json();

        // ✅ Update state only if the value is a non-empty string
        setPreviewImages((prev) => ({
          ...prev,
          GCash: data.qrCodeImage?.trim() || prev.GCash,
          Maya: data.qrCodeMayaImage?.trim() || prev.Maya,
        }));

        setNumbers((prev) => ({
          ...prev,
          GCash: data.paymentNumber?.trim() || prev.GCash,
          Maya: data.paymentMayaNumber?.trim() || prev.Maya,
        }));
      } catch (err) {
        console.error("Failed to fetch payment info:", err);
      }
    }
    loadPayment();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFiles((prev) => ({ ...prev, [method]: f }));
      setPreviewImages((prev) => ({
        ...prev,
        [method]: URL.createObjectURL(f),
      }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumbers((prev) => ({ ...prev, [method]: e.target.value }));
  };

  const handleSavePayment = async () => {
    try {
      const formData = new FormData();
      formData.append("section", method === "GCash" ? "payment" : "maya");
      formData.append("paymentNumber", numbers[method]);
      if (files[method]) formData.append("image", files[method]!);

      const res = await fetch("/api/cms", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save payment");
      alert(`${method} info saved!`);
    } catch (err) {
      console.error(err);
      alert(`❌ Failed to save ${method}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 space-y-6 mt-6">
      <h1 className="font-semibold text-xl mb-2 text-gray-800">Payment</h1>

      {/* Payment Method Selector */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setMethod("GCash")}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            method === "GCash"
              ? "bg-[#3C604C] text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          GCash
        </button>
        <button
          onClick={() => setMethod("Maya")}
          className={`flex-1 py-2 rounded-lg font-semibold ${
            method === "Maya"
              ? "bg-[#3C604C] text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Maya
        </button>
      </div>

      {/* Upload Image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#3C604C] file:text-white hover:file:bg-[#2F4A3A] transition-colors"
        />
      </div>

      {/* Number */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Number
        </label>
        <input
          type="text"
          value={numbers[method]}
          onChange={handleNumberChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
        />
      </div>

      {/* Preview */}
      <div className="mt-6 p-6 bg-[#3C604C] rounded-lg w-full text-white">
        <h1 className="text-2xl font-semibold mb-4 text-center">Payment</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="border p-2 rounded-lg shadow-sm bg-white">
            <Image
              src={previewImages[method]}
              alt={`${method} QR Code`}
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
          <p className="text-center text-lg">
            Scan or Pay via {method} <br />
            <span className="font-bold">{numbers[method]}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSavePayment}
        className="button-style"
      >
        Save
      </button>
    </div>
  );
}

export default QRCode;
