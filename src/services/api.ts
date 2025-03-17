
// Base API configuration
import { toast } from "sonner";

const API_BASE_URL = "/api";

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `Error: ${response.status}`;
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
  return response.json();
};

// Generic API request function with authentication
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  data?: any,
  isFormData: boolean = false
) => {
  const token = localStorage.getItem("authToken");
  
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  if (!isFormData && method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (data) {
    if (isFormData) {
      options.body = data;
    } else if (method !== "GET") {
      options.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    return handleApiResponse(response);
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("Network error. Please try again later.");
    throw error;
  }
};
