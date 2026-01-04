import React, { useState } from "react";

// Backend URL
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const BackendCheck: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "checking" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("Not checked");

  const checkBackend = async () => {
    setStatus("checking");
    setMessage("Checking...");
    try {
      const response = await fetch(`${BACKEND_URL}/ping`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.message === "Backend is alive!") {
        setStatus("success");
        setMessage("Connected ✅");
      } else {
        setStatus("error");
        setMessage("Unexpected response ❌");
      }
    } catch (err) {
      console.error("Backend check failed:", err);
      setStatus("error");
      setMessage("Failed to connect ❌");
    }
  };

  return (
    <div className="p-4 border rounded shadow-md max-w-sm mx-auto">
      <h2 className="text-xl font-bold mb-2">Backend Connection Test</h2>
      <button
        onClick={checkBackend}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Check Backend
      </button>
      <p className={`mt-3 font-semibold ${status === "success" ? "text-green-600" : "text-red-600"}`}>
        Status: {message}
      </p>
    </div>
  );
};

export default BackendCheck;


