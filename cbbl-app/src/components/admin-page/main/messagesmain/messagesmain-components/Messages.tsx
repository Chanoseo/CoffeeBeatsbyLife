"use client";

import { useEffect, useState } from "react";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  createdAt: string;
  replied: boolean;
}

function Messages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [showReply, setShowReply] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [repliedMessageId, setRepliedMessageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/contacts");
        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  const handleReplySubmit = async (
    e: React.FormEvent,
    email: string,
    messageId: string
  ) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/contacts/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, message: replyMessage, messageId }),
      });

      const result = await res.json();

      if (res.ok) {
        setReplyMessage("");
        setShowReply(null);
        setRepliedMessageId(messageId);

        // Update the state so replied = true without refreshing
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === messageId ? { ...msg, replied: true } : msg
          )
        );

        setTimeout(() => setRepliedMessageId(null), 4000);
      } else {
        alert(result.error || "Failed to send email");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    }
  };
  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch("/api/contacts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: messageId }),
      });

      const result = await res.json();

      if (res.ok) {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      } else {
        alert(result.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <section className="dashboard-card">
      <h1 className="text-2xl mb-4">Received Messages</h1>
      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <p>No messages found.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="border border-gray-200 p-6 rounded-xl bg-gray-50 hover:bg-green-200 shadow"
            >
              {repliedMessageId === msg.id && (
                <p className="message-success">Message Sent.</p>
              )}

              {/* Show only if already replied */}
              {msg.replied && (
                <p className="message-success">
                  This message has already received a response.
                </p>
              )}

              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold">{msg.name}</p>
                <div className="flex items-center gap-3 text-gray-600">
                  <p className="text-sm">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </p>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="text-xl cursor-pointer hover:text-red-500 transition"
                    onClick={() => handleDelete(msg.id)}
                  />
                </div>
              </div>

              <p className="text-gray-700">{msg.email}</p>
              <p className="my-4 text-gray-800 leading-relaxed">
                {msg.content}
              </p>

              {/* Hide reply button if already replied */}
              {!msg.replied && showReply !== msg.id ? (
                <button
                  onClick={() => setShowReply(msg.id)}
                  className="bg-[#3C604C] px-4 py-2 rounded-lg text-white font-medium hover:bg-[#2f4b3b] transition cursor-pointer"
                >
                  Reply
                </button>
              ) : (
                !msg.replied &&
                showReply === msg.id && (
                  <div className="bg-white p-4 rounded-xl mt-4 border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-medium text-gray-700">
                        To: <span className="text-gray-900">{msg.email}</span>
                      </p>
                      <button
                        onClick={() => setShowReply(null)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <form
                      onSubmit={(e) => handleReplySubmit(e, msg.email, msg.id)}
                      className="flex flex-col gap-3"
                    >
                      <textarea
                        name="message"
                        placeholder="Write your message..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="w-full min-h-[120px] border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-green-400"
                        required
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
                )
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default Messages;
