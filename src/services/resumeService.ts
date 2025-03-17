import { apiRequest } from "./api";

export interface Resume {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedAt: Date;
  status: 'pending' | 'reviewed' | 'approved';
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface ResumeUploadResponse {
  message: string;
  fileUrl: string;
}

export const resumeService = {
  // 上传简历文件
  uploadResume: async (file: File, title: string): Promise<ResumeUploadResponse> => {
    const formData = new FormData();
    formData.append("Resume", file);
    // 如果后端API需要标题，可以添加
    // formData.append("Title", title);
    
    return apiRequest("/Resume", "POST", formData, true);
  },
  
  // 获取简历列表
  getResumes: async (): Promise<Resume[]> => {
    try {
      const response = await apiRequest("/Resume");
      
      // 确保响应是数组
      if (!Array.isArray(response)) {
        console.error('API 返回的不是数组数据:', response);
        return [];
      }
      
      // 将后端返回的数据格式映射到前端使用的格式
      return response.map((item: any) => {
        // 处理comments字段
        let comments: Comment[] = [];
        if (item.comments) {
          // 如果comments是字符串，尝试解析或者创建一个简单的评论
          if (typeof item.comments === 'string') {
            comments = [{
              id: `comment-${item.resumeID}`,
              content: item.comments,
              createdBy: item.reviewerID ? `Reviewer ID: ${item.reviewerID}` : 'System',
              createdAt: new Date(item.uploadDate)
            }];
          } 
          // 如果comments是数组，映射为前端格式
          else if (Array.isArray(item.comments)) {
            comments = item.comments.map((c: any, index: number) => ({
              id: c.id || `comment-${item.resumeID}-${index}`,
              content: c.content || c.toString(),
              createdBy: c.createdBy || 'Reviewer',
              createdAt: new Date(c.createdAt || item.uploadDate)
            }));
          }
        }
        
        // 格式化日期
        let uploadDate;
        try {
          uploadDate = new Date(item.uploadDate);
          // 检查日期是否有效
          if (isNaN(uploadDate.getTime())) {
            uploadDate = new Date(); // 默认为当前日期
          }
        } catch (e) {
          uploadDate = new Date();
        }
        
        // 处理文件名作为标题，去掉扩展名
        const nameParts = item.fileName.split('.');
        nameParts.pop(); // 移除扩展名
        const title = nameParts.join('.') || item.fileName;
        
        // 映射状态值
        let status: 'pending' | 'reviewed' | 'approved' = 'pending';
        if (typeof item.status === 'number') {
          switch (item.status) {
            case 1: status = 'reviewed'; break;
            case 2: status = 'approved'; break;
            default: status = 'pending'; break;
          }
        } else if (typeof item.status === 'string') {
          const statusLower = item.status.toLowerCase();
          if (statusLower.includes('review')) status = 'reviewed';
          else if (statusLower.includes('approv')) status = 'approved';
        }
        
        return {
          id: item.resumeID.toString(),
          title: title,
          fileName: item.fileName,
          fileUrl: item.fileUrl,
          uploadedBy: `User ${item.userID}`, // 从用户上下文获取或使用默认值
          uploadedAt: uploadDate,
          status: status,
          comments: comments
        };
      });
    } catch (error) {
      console.error('获取简历列表时出错:', error);
      return [];
    }
  },
  
  // 下载简历文件
  downloadResume: async (fileUrl: string, fileName: string): Promise<void> => {
    try {
      // 判断URL是否为绝对路径
      const url = fileUrl.startsWith('http') ? fileUrl : `${window.location.origin}${fileUrl}`;
      
      // 使用fetch获取文件
      const response = await fetch(url, {
        headers: {
          // 如果需要身份验证，可以添加令牌
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }
      
      // 获取blob数据
      const blob = await response.blob();
      
      // 创建一个临时下载链接
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 释放URL对象
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  },

  //评论和更新状态
   reviewResume: async (
    resumeId: string, 
    status: Resume['status'], 
    comment?: string
  ): Promise<{ message: string }> => {
    // 映射前端状态到后端枚举
    const backendStatus = {
      'pending': 0,   // Pending
      'reviewed': 1,  // Approved
      'approved': 2   // Rejected
    }[status];

    return apiRequest(`/Resume/${resumeId}/review`, "POST", { 
      status: backendStatus, 
      comments: comment || '' 
    });
  },
  // 删除简历
  deleteResume: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/Resume/${id}`, "DELETE");
  },
  
  // 获取简历模板
  getTemplate: async (): Promise<{ templateUrl: string }> => {
    return apiRequest("/Resume/template");
  }
};