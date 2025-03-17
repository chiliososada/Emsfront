
import { apiRequest } from "./api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  userType: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  userID: number;
  username: string;
  userType: number;
  token: string;
  isSuccess: boolean;
  message: string;
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest("/Auth/login", "POST", credentials);
    
    if (response.isSuccess && response.token) {
      // Store the token and user info
      localStorage.setItem("authToken", response.token);
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userInfo", JSON.stringify({
        id: response.userID,
        username: response.username,
        userType: response.userType
      }));
    }
    
    return response;
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    return apiRequest("/Auth/register", "POST", userData);
  },
  
  changePassword: async (passwordData: ChangePasswordRequest): Promise<{ message: string }> => {
    return apiRequest("/Auth/change-password", "POST", passwordData);
  },
  
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userInfo");
  }
};
