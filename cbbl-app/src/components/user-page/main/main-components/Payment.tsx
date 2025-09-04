"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  setPaymentProof: (fileBase64: string | null) => void; // expects Base64
}

function Payment({ setPaymentProof }: Props) {
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);

      // ✅ convert to Base64 for API
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPaymentProof(base64String); // pass Base64 up
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="mt-6 p-6 bg-[#3C604C] rounded-lg w-full text-white">
        <h1 className="text-2xl font-semibold mb-4 text-center">Payment</h1>

        <div className="flex flex-col items-center gap-4">
          <div className="border p-2 rounded-lg shadow-sm bg-white">
            <Image
              src="/gcash-qrcode.png"
              alt="GCash QR Code"
              width={200}
              height={200}
              className="rounded-md"
            />
          </div>

          <p className="text-center text-lg">
            Scan or Pay via GCash <br />
            <span className="font-bold">+63 947 261 2046</span>
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
