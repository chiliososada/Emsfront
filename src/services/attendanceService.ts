import { apiRequest } from "./api";

export interface Attendance {
  attendanceID: number;
  userID: number;
  username?: string;
  month: string;
  fileUrl: string;
  transportationFileUrl?: string;
  uploadDate: Date;
  status: number;
  workHours?: number;
  transportationFee?: number;
  comments?: string;
  reviewerID?: number;
  reviewerName?: string;
}

export interface AttendanceUploadRequest {
  month: string;
  workHours: number;
  transportationFee: number;
  file: File;
  transportationFile?: File;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

// 把状态码转换成文本
export const getStatusText = (status: number): string => {
  switch (status) {
    case 0: return '待审核';
    case 1: return '已批准';
    case 2: return '已拒绝';
    default: return '未知状态';
  }
};

export const attendanceService = {
  // 获取勤务表列表
  getAttendances: async (
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = "uploadDate",
    sortDirection: string = "desc",
    filters?: { month?: string; status?: number; userId?: number }
  ): Promise<PaginatedResponse<Attendance>> => {
    let queryParams = `?PageNumber=${page}&PageSize=${pageSize}&SortBy=${sortBy}&SortDirection=${sortDirection}`;
    
    if (filters) {
      if (filters.month) {
        queryParams += `&Month=${filters.month}`;
      }
      
      if (filters.status !== undefined && filters.status !== null) {
        queryParams += `&Status=${filters.status}`;
      }
      
      if (filters.userId) {
        queryParams += `&UserId=${filters.userId}`;
      }
    }
    
    const response = await apiRequest(`/Attendance${queryParams}`);
    
    // 处理日期格式
    if (response.items && Array.isArray(response.items)) {
      response.items = response.items.map(item => ({
        ...item,
        uploadDate: new Date(item.uploadDate)
      }));
    }
    
    return response;
  },

  // 上传勤务表
  uploadAttendance: async (data: AttendanceUploadRequest): Promise<{ message: string; fileUrl: string }> => {
    const formData = new FormData();
    formData.append("File", data.file);
    formData.append("Month", data.month);
    formData.append("WorkHours", data.workHours.toString());
    formData.append("TransportationFee", data.transportationFee.toString());
    
    if (data.transportationFile) {
      formData.append("TransportationFile", data.transportationFile);
    }
    
    return apiRequest("/Attendance", "POST", formData, true);
  },

  // 下载模板
  downloadTemplate: async (type: "attendance" | "transportation"): Promise<void> => {
    try {
      const endpoint = type === "attendance" 
        ? "/Attendance/template" 
        : "/Attendance/transportation-template";
      
      const response = await apiRequest(endpoint);
      
      if (!response.templateUrl) {
        throw new Error("模板URL不存在");
      }
      
      // 使用FileController的下载端点
      const fileUrl = response.templateUrl;
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2] || 'templates';
      
      const fileResponse = await fetch(`/api/File/${folder}/${fileName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!fileResponse.ok) {
        throw new Error(`下载失败: ${fileResponse.status}`);
      }
      
      const blob = await fileResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载模板失败:', error);
      throw error;
    }
  },

  // 删除勤务表
  deleteAttendance: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/Attendance/${id}`, "DELETE");
  },

  // 审核勤务表
  reviewAttendance: async (
    id: number, 
    status: number, 
    comments?: string
  ): Promise<{ message: string }> => {
    return apiRequest(`/Attendance/${id}/review`, "POST", { 
      status, 
      comments 
    });
  },
  
  // 下载勤务表文件
  downloadAttendanceFile: async (fileUrl: string, fileName: string): Promise<void> => {
    try {
      // 从fileUrl中提取文件夹和文件名
      const urlParts = fileUrl.split('/');
      const fileNameFromUrl = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2] || 'attendances';
      
      // 使用FileController的下载端点
      const response = await fetch(`/api/File/${folder}/${fileNameFromUrl}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || fileNameFromUrl || '勤务表.xlsx';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('文件下载失败:', error);
      throw error;
    }
  }
};