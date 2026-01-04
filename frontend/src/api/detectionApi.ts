// src/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface DetectionResult {
  result: "authentic" | "fake" | "suspicious";
  confidence: number;
  details: string;
}

// Helper to handle fetch errors
const handleResponse = async (response: Response): Promise<DetectionResult> => {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error: ${text}`);
  }
  return response.json();
};

// Image detection
export const detectImage = async (file: File): Promise<DetectionResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/detect/image`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

// Video detection
export const detectVideo = async (file: File): Promise<DetectionResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/detect/video`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

// Audio detection
export const detectAudio = async (file: File): Promise<DetectionResult> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/detect/audio`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

// URL detection
export const detectUrl = async (url: string): Promise<DetectionResult> => {
  const response = await fetch(`${API_BASE_URL}/api/detect/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  return handleResponse(response);
};

// Existing JSON email detection
export const detectEmail = async (
  subject: string,
  body: string,
  sender?: string
): Promise<DetectionResult> => {
  const response = await fetch(`${API_BASE_URL}/api/detect/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subject, body, sender }),
  });

  return handleResponse(response);
};

// ✅ New plain text email detection
export const detectEmailPlain = async (emailText: string): Promise<DetectionResult> => {
  const response = await fetch(`${API_BASE_URL}/api/detect/email-plain`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain", // important
      "Accept": "application/json",
    },
    body: emailText, // send raw string
  });

  return handleResponse(response);
};







