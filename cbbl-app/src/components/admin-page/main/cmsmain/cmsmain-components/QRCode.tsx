"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type CMSPayment = {
  qrCodeImage?: string;
  paymentNumber?: string;
};

function QRCode() {
  const [previewImage, setPreviewImage] = useState<string>("/gcash-qrcode.png");
  const [number, setNumber] = useState<string>("9472612046");
  const [file, setFile] = useState<File | null>(null);

  // ✅ Load saved payment info when page loads
  useEffect(() => {
    async function loadPayment() {
      try {
        const res = await fetch("/api/cms");
        if (!res.ok) return;
        const data: CMSPayment = await res.json();
        if (data?.qrCodeImage) setPreviewImage(data.qrCodeImage);
        if (data?.paymentNumber) setNumber(data.paymentNumber);
      } catch (err) {
        console.error("Failed to fetch payment info:", err);
      }
    }
    loadPayment();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const url = URL.createObjectURL(f);
      setPreviewImage(url); // preview chosen file
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(e.target.value);
  };

  const handleSavePayment = async () => {
    try {
      const formData = new FormData();
      formData.append("section", "payment");
      formData.append("paymentNumber", number);
      if (file) formData.append("image", file);

      const res = await fetch("/api/cms", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to save payment");
      alert("✅ Payment info saved!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save payment");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6 mt-6">
      <h1 className="font-semibold text-xl mb-2 text-gray-800">Payment</h1>

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
          placeholder="9472612046"
          value={number}
          onChange={handleNumberChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3C604C] focus:border-transparent transition"
        />
      </div>

      {/* ✅ Preview */}
      <div className="mt-6 p-6 bg-[#3C604C] rounded-lg w-full text-white">
        <h1 className="text-2xl font-semibold mb-4 text-center">Payment</h1>
        <div className="flex flex-col items-center gap-4">
          <div className="border p-2 rounded-lg shadow-sm bg-white">
            <Image
              src={previewImage}
              alt="GCash QR Code"
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
          <p className="text-center text-lg">
            Scan or Pay via GCash <br />
            <span className="font-bold">{number}</span>
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
