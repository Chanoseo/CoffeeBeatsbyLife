"use client"

import { useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Messages() {
  const [showReply, setShowReply] = useState<boolean>(false);

  return (
    <section className="dashboard-card">
      <h1 className="text-2xl mb-4">Received Messages</h1>
      <div className="flex flex-col gap-4">
        <div className="border border-gray-200 p-6 rounded-xl bg-green-50 hover:bg-green-100 shadow">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">Kristian Josef Banatlao</p>
            <div className="flex items-center gap-3 text-gray-600">
              <p className="text-sm">Aug 25, 2025</p>
              <FontAwesomeIcon
                icon={faTrash}
                className="text-xl cursor-pointer hover:text-red-500 transition"
              />
            </div>
          </div>

          {/* Email */}
          <p className="text-gray-700">kristianjosefrbanatlao@gmail.com</p>

          {/* Message */}
          <p className="my-4 text-gray-800 leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit,
            consequatur, vitae aut sit enim quae tenetur ipsam est doloribus
            ipsa non blanditiis corrupti accusamus laudantium dignissimos
            temporibus nihil omnis praesentium?
          </p>

          {/* Toggle between Reply button and form */}
          {!showReply ? (
            <button
              onClick={() => setShowReply(true)}
              className="bg-[#3C604C] px-4 py-2 rounded-lg text-white font-medium hover:bg-[#2f4b3b] transition cursor-pointer"
            >
              Reply
            </button>
          ) : (
            <div className="bg-white p-4 rounded-xl mt-4 border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">
                  To:{" "}
                  <span className="text-gray-900">
                    kristianjosefrbanatlao@gmail.com
                  </span>
                </p>
                <button
                  onClick={() => setShowReply(false)}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
              <form action="" className="flex flex-col gap-3">
                <textarea
                  name="message"
                  placeholder="Write your message..."
                  className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#3C604C] px-5 py-2 rounded-lg text-white font-medium hover:bg-[#2f4b3b] transition cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Messages;
