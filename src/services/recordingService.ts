import { apiRequest } from "./api";

export interface Recording {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  caseContent: string;
  caseInformation: string;
}

export interface RecordingUploadResponse {
  message: string;
  fileUrl: string;
}

export const recordingService = {
  // Upload recording file - mock implementation for now
  uploadRecording: async (file: File, title: string, caseContent: string, caseInformation: string): Promise<RecordingUploadResponse> => {
    // Mock implementation - to be replaced with actual API call
    console.log("Mock uploading recording:", { title, caseContent, caseInformation, fileName: file.name });
    
    // Simulate network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          message: "录音文件上传成功",
          fileUrl: URL.createObjectURL(file)
        });
      }, 1500);
    });
  },
  
  // Get recordings list - mock implementation
  getRecordings: async (): Promise<Recording[]> => {
    // Mock implementation - to be replaced with actual API call
    console.log("Mock fetching recordings list");
    
    // In real implementation, this would be:
    // return apiRequest("/Recording");
    
    // Empty array for now as mock data
    return [];
  },
  
  // Download recording file
  downloadRecording: async (fileUrl: string, fileName: string): Promise<void> => {
    try {
      // This is a basic direct download implementation
      // For actual integration, you would use:
      // const response = await fetch(`/api/File/recordings/${fileName}`);
      
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }
      
      // Get file data and create Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create download link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }
};