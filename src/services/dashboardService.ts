import { apiRequest } from "./api";

export interface DashboardData {
  questionStats: {
    totalQuestions: number;
    personalQuestions: number;
    companyQuestions: number;
  };
  caseStats: {
    activeCases: number;
  };
  resumeStats: {
    pendingResumes: number;
    approvedResumes: number;
    rejectedResumes: number;
    totalResumes: number;
  };
  userStats?: {
    totalUsers: number;
    activeUsers: number;
    studentCount: number;
    teacherCount: number;
    adminCount: number;
  };
}

export const dashboardService = {
  // 获取仪表盘数据并确保数据完整性
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      const data = await apiRequest("/Dashboard");
      
      // 确保返回数据符合预期结构，如缺少某些属性则提供默认值
      return {
        questionStats: {
          totalQuestions: data.questionStats?.totalQuestions || 0,
          personalQuestions: data.questionStats?.personalQuestions || 0,
          companyQuestions: data.questionStats?.companyQuestions || 0,
        },
        caseStats: {
          activeCases: data.caseStats?.activeCases || 0,
        },
        resumeStats: {
          pendingResumes: data.resumeStats?.pendingResumes || 0,
          approvedResumes: data.resumeStats?.approvedResumes || 0,
          rejectedResumes: data.resumeStats?.rejectedResumes || 0,
          totalResumes: data.resumeStats?.totalResumes || 0,
        },
        userStats: data.userStats ? {
          totalUsers: data.userStats.totalUsers || 0,
          activeUsers: data.userStats.activeUsers || 0,
          studentCount: data.userStats.studentCount || 0,
          teacherCount: data.userStats.teacherCount || 0,
          adminCount: data.userStats.adminCount || 0,
        } : undefined,
      };
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      throw error;
    }
  }
};