import { apiRequest } from "./api";

export interface Recording {
  recordingID: number;
  userID: number;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  caseContent: string;
  caseInformation: string;
  username?: string;
   // 兼容性属性，确保前端组件能正常工作
   id?: string;  // 添加 id 属性
   uploadedAt?: Date; // 添加 uploadedAt 属性
   uploadedBy?: string; // 添加 uploadedBy 属性
}

export interface RecordingUploadResponse {
  message: string;
  fileUrl: string;
}

export const recordingService = {
  // 上传录音文件
  uploadRecording: async (file: File, title: string, caseContent: string, caseInformation: string): Promise<RecordingUploadResponse> => {
    const formData = new FormData();
    formData.append("Recording", file);
    formData.append("Title", title);
    formData.append("CaseContent", caseContent);
    formData.append("CaseInformation", caseInformation);
    
    return apiRequest("/Recording", "POST", formData, true);
  },
  
  // 获取录音列表
  // 获取录音列表
getRecordings: async (): Promise<Recording[]> => {
  try {
    const response = await apiRequest("/Recording");
    
    // 确保响应是数组
    if (!Array.isArray(response)) {
      console.error('API 返回的不是数组数据:', response);
      return [];
    }
    
    // 将后端返回的数据格式映射到前端使用的格式
    return response.map((item: any) => {
      // 格式化日期
      let uploadDate;
      try {
        uploadDate = new Date(item.uploadDate);
        // 检查日期是否有效
        if (isNaN(uploadDate.getTime())) {
          uploadDate = new Date();
        }
      } catch (e) {
        uploadDate = new Date();
      }
      
      return {
        recordingID: item.recordingID,
        userID: item.userID,
        title: item.title || '',
        fileName: item.fileName || '',
        fileUrl: item.fileUrl || '',
        uploadDate: uploadDate,
        caseContent: item.caseContent || '',
        caseInformation: item.caseInformation || '',
        username: item.username,
        
        // 兼容性属性
        id: item.recordingID.toString(),
        uploadedAt: uploadDate,
        uploadedBy: item.username || `User ${item.userID}`
      };
    });
  } catch (error) {
    console.error('获取录音列表失败:', error);
    return [];
  }
},
  
  // 获取单个录音详情
  getRecordingById: async (id: number): Promise<Recording> => {
    return apiRequest(`/Recording/${id}`);
  },
  
  // 删除录音
  deleteRecording: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/Recording/${id}`, "DELETE");
  },
  
  // 下载录音文件
  downloadRecording: async (fileUrl: string, fileName: string): Promise<void> => {
    try {
      // 从fileUrl中提取文件夹和文件名
      const urlParts = fileUrl.split('/');
      const fileNameFromUrl = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2] || 'recordings';
      
      // 使用FileController的下载端点
      const response = await fetch(`/api/File/${folder}/${fileNameFromUrl}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }
      
      // 获取文件数据并创建Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 创建下载链接并触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || fileNameFromUrl || '录音文件.mp3';
      
      // 触发下载
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // 释放URL对象
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  },
  // 文件路径: src/services/recordingService.ts
// 添加分片上传相关方法:

// 初始化分片上传
initChunkedUpload: async (fileName: string): Promise<{ tempFilePath: string }> => {
  return apiRequest("/Recording/init-chunked-upload", "POST", { fileName });
},

// 上传单个分片
uploadChunk: async (tempFilePath: string, chunk: Blob, chunkIndex: number, totalChunks: number): 
  Promise<{ progress: number }> => {
  const formData = new FormData();
  formData.append("TempFilePath", tempFilePath);
  formData.append("Chunk", new File([chunk], "chunk"));
  formData.append("ChunkIndex", chunkIndex.toString());
  formData.append("TotalChunks", totalChunks.toString());
  
  return apiRequest("/Recording/upload-chunk", "POST", formData, true);
},

// 完成分片上传
completeChunkedUpload: async (tempFilePath: string, fileName: string, title: string, 
  caseContent: string, caseInformation: string): Promise<RecordingUploadResponse> => {
  return apiRequest("/Recording/complete-chunked-upload", "POST", {
    tempFilePath,
    fileName,
    title,
    caseContent,
    caseInformation
  });
},

// 支持进度显示的上传方法
uploadRecordingWithProgress: async (
  file: File, 
  title: string, 
  caseContent: string, 
  caseInformation: string,
  onProgress: (progress: number) => void
): Promise<RecordingUploadResponse> => {
  // 小文件使用普通上传
  if (file.size < 5 * 1024 * 1024) {
    const formData = new FormData();
    formData.append("Recording", file);
    formData.append("Title", title);
    formData.append("CaseContent", caseContent);
    formData.append("CaseInformation", caseInformation);
    
    onProgress(10);
    const result = await apiRequest("/Recording", "POST", formData, true);
    onProgress(100);
    return result;
  }
  
  // 大文件使用分片上传
  try {
    // 1. 初始化上传
    onProgress(1);
    const { tempFilePath } = await recordingService.initChunkedUpload(file.name);
    
    // 2. 计算分片
    const chunkSize = 1024 * 1024; // 每片1MB
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // 3. 上传分片
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);
      
      const { progress } = await recordingService.uploadChunk(tempFilePath, chunk, i, totalChunks);
      onProgress(progress);
    }
    
    // 4. 完成上传
    return await recordingService.completeChunkedUpload(
      tempFilePath,
      file.name,
      title,
      caseContent,
      caseInformation
    );
  } catch (error) {
    console.error('分片上传失败:', error);
    throw error;
  }
}
}