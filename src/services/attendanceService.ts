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
  attendanceFile: File;
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
    sortBy: string = "month",
    sortDirection: string = "desc"
  ): Promise<PaginatedResponse<Attendance>> => {
    // 这里是模拟数据，实际项目中需要替换为真实API调用
    const mockData: Attendance[] = Array(20).fill(null).map((_, index) => ({
      attendanceID: index + 1,
      userID: 1,
      username: '当前用户',
      month: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}`,
      fileUrl: '/api/fake-url/attendance.xlsx',
      transportationFileUrl: Math.random() > 0.3 ? '/api/fake-url/transportation.pdf' : undefined,
      uploadDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      status: Math.floor(Math.random() * 3),
      workHours: Math.floor(Math.random() * 160) + 40,
      transportationFee: Math.floor(Math.random() * 20000) + 1000,
      comments: Math.random() > 0.7 ? '已审核通过' : undefined,
      reviewerID: Math.random() > 0.5 ? 2 : undefined,
      reviewerName: Math.random() > 0.5 ? '审核员' : undefined
    }));

    // 根据sortBy和sortDirection排序
    mockData.sort((a, b) => {
      const key = sortBy as keyof Attendance;
      const aValue = a[key];
      const bValue = b[key];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      // 日期类型的比较
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      
      // 字符串类型的比较
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // 数字类型的比较
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    // 根据page和pageSize分页
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = mockData.slice(start, end);

    return {
      items: paginatedItems,
      totalCount: mockData.length,
      pageCount: Math.ceil(mockData.length / pageSize),
      currentPage: page,
      pageSize: pageSize
    };

    // 实际项目中的API调用应该是这样：
    // return apiRequest(
    //   `/Attendance?PageNumber=${page}&PageSize=${pageSize}&SortBy=${sortBy}&SortDirection=${sortDirection}`
    // );
  },

  // 上传勤务表
  uploadAttendance: async (data: AttendanceUploadRequest): Promise<{ message: string }> => {
    console.log('模拟上传勤务表:', data);
    
    // 模拟上传延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 返回模拟成功响应
    return { message: "勤务表上传成功" };

    // 实际项目中的代码：
    // const formData = new FormData();
    // formData.append("Month", data.month);
    // formData.append("WorkHours", data.workHours.toString());
    // formData.append("TransportationFee", data.transportationFee.toString());
    // formData.append("File", data.attendanceFile);
    // 
    // if (data.transportationFile) {
    //   formData.append("TransportationFile", data.transportationFile);
    // }
    // 
    // return apiRequest("/Attendance", "POST", formData, true);
  },

  // 下载模板
  downloadTemplate: async (type: "attendance" | "transportation"): Promise<void> => {
    try {
      // 在实际项目中，这里应该调用真实的API
      // const response = await fetch(`/api/File/templates/${type}_template.xlsx`);
      
      // 模拟下载延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`模拟下载${type}模板`);
      
      // 实际项目中，应该像这样处理：
      // if (!response.ok) {
      //   throw new Error(`模板下载失败: ${response.status}`);
      // }
      // 
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement('a');
      // a.href = url;
      // a.download = `${type}_template.xlsx`;
      // document.body.appendChild(a);
      // a.click();
      // window.URL.revokeObjectURL(url);
      // document.body.removeChild(a);
    } catch (error) {
      console.error('下载模板失败:', error);
      throw error;
    }
  },

  // 删除勤务表
  deleteAttendance: async (id: number): Promise<{ message: string }> => {
    console.log('模拟删除勤务表:', id);
    
    // 模拟删除延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回模拟成功响应
    return { message: "勤务表删除成功" };

    // 实际项目中的代码：
    // return apiRequest(`/Attendance/${id}`, "DELETE");
  },

  // 审核勤务表
  reviewAttendance: async (
    id: number, 
    status: number, 
    comments?: string
  ): Promise<{ message: string }> => {
    console.log('模拟审核勤务表:', { id, status, comments });
    
    // 模拟审核延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回模拟成功响应
    return { message: `勤务表审核成功，状态: ${getStatusText(status)}` };

    // 实际项目中的代码：
    // return apiRequest(`/Attendance/${id}/review`, "POST", { 
    //   status, 
    //   comments 
    // });
  }
};