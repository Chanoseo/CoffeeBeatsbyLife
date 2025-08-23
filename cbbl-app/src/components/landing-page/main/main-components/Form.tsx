"use client";

import { useState } from "react";
import SendMessageButton from "./MessageButton";

function Form() {
  type Status = "idle" | "loading" | "success" | "error";

  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData) as {
      name?: string;
      email?: string;
      message?: string;
    };

    // Basic client-side validation
    if (!data.name || !data.email || !data.message) {
      setStatus("error");
      setMessage("Please fill in all fields.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus("success");
        setMessage("Message sent successfully!");
        form.reset();
      } else {
        const { error } = await res.json();
        setStatus("error");
        setMessage(error || "Failed to send message.");
      }
    } catch {
      setStatus("error");
      setMessage("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-4/5 mt-10 p-8 rounded shadow-sm shadow-black/30"
    >
      <h1 className="text-2xl font-bold">Send Us a Message</h1>
      <p className="mt-2">We&apos;d love to hear from you!</p>
      <hr className="my-4 text-gray-300" />

      {status !== "idle" && message && (
        <div
          className={`${
            status === "success"
              ? "message-success"
              : status === "loading"
              ? "message-loading"
              : "message-error"
          }`}
          role={status === "success" ? "status" : "alert"}
        >
          {message}
        </div>
      )}

      <div className="flex flex-col gap-4 mt-4">
        <label className="text-lg font-semibold" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your Name"
          className="message-input-style"
          autoComplete="name"
          required
        />

        <label className="text-lg font-semibold" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Your Email"
          className="message-input-style"
          autoComplete="email"
          required
        />

        <label className="text-lg font-semibold" htmlFor="message">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="Your Message"
          className="message-input-style h-32"
          required
        ></textarea>
      </div>
      <SendMessageButton />
    </form>
  );
}

export default Form;
