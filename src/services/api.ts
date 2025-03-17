// Base API configuration
import { toast } from "sonner";

const API_BASE_URL = "/api";

// Helper function to handle API responses
export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || `Error: ${response.status}`;
    } catch (e) {
      errorMessage = `Error: ${response.status}`;
    }
    
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
  
  // 确保返回JSON响应
  try {
    return await response.json();
  } catch (e) {
    // 如果响应不是JSON格式，返回原始响应文本
    return response.text();
  }
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
    console.log(`API Request: ${method} ${API_BASE_URL}${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    console.log(`API Response status: ${response.status}`);
    return handleApiResponse(response);
  } catch (error) {
    console.error("API request failed:", error);
    toast.error("网络错误。请稍后重试。");
    throw error;
  }
};