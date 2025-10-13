"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface Props {
  setPaymentProof: (fileBase64: string | null) => void; // expects Base64
}

interface PaymentData {
  qrCodeImage?: string; // GCash
  paymentNumber?: string; // GCash
  qrCodeMayaImage?: string;
  paymentMayaNumber?: string;
}

function Payment({ setPaymentProof }: Props) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    qrCodeImage: "/gcash-qrcode.png",
    paymentNumber: "+63 947 261 2046",
    qrCodeMayaImage: "/maya-qrcode.png",
    paymentMayaNumber: "0947 261 2046",
  });
  const [paymentMethod, setPaymentMethod] = useState<"GCash" | "Maya">("GCash");

  useEffect(() => {
    async function fetchPaymentData() {
      try {
        const res = await fetch("/api/cms");
        const data: PaymentData = await res.json();

        setPaymentData((prev) => ({
          qrCodeImage: data.qrCodeImage || prev.qrCodeImage,
          paymentNumber: data.paymentNumber || prev.paymentNumber,
          qrCodeMayaImage: data.qrCodeMayaImage || prev.qrCodeMayaImage,
          paymentMayaNumber: data.paymentMayaNumber || prev.paymentMayaNumber,
        }));
      } catch (err) {
        console.error("Failed to fetch payment data:", err);
      }
    }
    fetchPaymentData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPaymentProof(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Pick data depending on the selected method
  const qrCode =
    paymentMethod === "GCash"
      ? paymentData.qrCodeImage!
      : paymentData.qrCodeMayaImage!;
  const number =
    paymentMethod === "GCash"
      ? paymentData.paymentNumber!
      : paymentData.paymentMayaNumber!;

  return (
    <div>
      <div className="mt-6 p-6 bg-[#3C604C] rounded-lg w-full text-white">
        {/* Payment Method Selector */}
        <div className="flex justify-center gap-2 bg-white p-1 rounded-full mb-6 w-full max-w-sm mx-auto">
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition-all duration-300 ${
              paymentMethod === "GCash"
                ? "bg-[#3C604C] text-white shadow-inner"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("GCash")}
          >
            GCash
          </button>
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition-all duration-300 ${
              paymentMethod === "Maya"
                ? "bg-[#3C604C] text-white shadow-inner"
                : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setPaymentMethod("Maya")}
          >
            Maya
          </button>
        </div>

        <h1 className="text-2xl font-semibold mb-4 text-center">Payment</h1>

        <div className="flex flex-col items-center gap-4">
          <div className="border p-2 rounded-lg shadow-sm bg-white">
            <Image
              src={qrCode}
              alt={`${paymentMethod} QR Code`}
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>
          <p className="text-center text-lg">
            Scan or Pay via {paymentMethod} <br />
            <span className="font-bold">{number}</span>
          </p>
          <p className="text-center text-sm">
            After payment, please send a screenshot to confirm your reservation.
          </p>
        </div>
      </div>

      <div className="mt-6 w-full flex flex-col items-center">
        <label className="text-lg font-semibold mb-4">
          Upload Payment Screenshot
        </label>

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-[#3C604C] transition-colors bg-gray-50 dark:bg-gray-700"
        >
          <span className="text-gray-500 dark:text-gray-200">
            Drag & Drop your file here or click to browse
          </span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {screenshot && (
          <div className="mt-4 border p-2 rounded-lg w-fit flex justify-center bg-white">
            <Image
              loader={() => URL.createObjectURL(screenshot)}
              src={URL.createObjectURL(screenshot)}
              alt="Uploaded Screenshot"
              width={400}
              height={400}
              className="max-w-full h-auto rounded-md"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Payment;
