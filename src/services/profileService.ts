
import { apiRequest } from "./api";

export interface ProfileData {
  fullName: string;
  gender?: string;
  birthDate?: string;
  birthPlace?: string;
  address?: string;
  introduction?: string;
  hobbies?: string;
}

export const profileService = {
  getProfile: async (): Promise<ProfileData> => {
    return apiRequest("/Profile");
  },
  
  updateProfile: async (profileData: ProfileData): Promise<{ message: string }> => {
    return apiRequest("/Profile", "PUT", profileData);
  },
  
  uploadAvatar: async (avatarFile: File): Promise<{ message: string, avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("Avatar", avatarFile);
    
    return apiRequest("/Profile/avatar", "POST", formData, true);
  }
};
