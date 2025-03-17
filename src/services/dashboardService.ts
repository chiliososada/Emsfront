
import { apiRequest } from "./api";

export interface DashboardData {
  questionStats: {
    total: number;
    recent: number;
    byCategory: Record<string, number>;
  };
  caseStats: {
    total: number;
    upcoming: number;
    completed: number;
  };
  resumeStats: {
    total: number;
    pending: number;
    approved: number;
  };
  userStats: {
    total: number;
    active: number;
  };
}

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await apiRequest("/Dashboard");
    
    // 将后端返回的数据转换为前端所需格式
    return {
      questionStats: {
        total: response.questionStats.totalQuestions,
        recent: response.questionStats.personalQuestions, // 或其他适合的值
        byCategory: {
          personal: response.questionStats.personalQuestions,
          company: response.questionStats.companyQuestions
        }
      },
      caseStats: {
        total: response.caseStats.activeCases,
        upcoming: 0, // 后端没提供，设置默认值
        completed: 0 // 后端没提供，设置默认值
      },
      resumeStats: {
        total: response.resumeStats.totalResumes,
        pending: response.resumeStats.pendingResumes,
        approved: response.resumeStats.approvedResumes
      },
      userStats: response.userStats || {
        total: 0,
        active: 0
      }
    };
  }
};
