import { apiRequest } from "./api";

export interface Question {
  questionID: number;
  caseID: number;
  questionText: string;
  answer: string;
  source: number;
  status: number | string;
  createdAt: string;
  username: string;
  userID: number;
  caseName: string;    // 从Case对象获取的字段
  companyName: string; // 从Case对象获取的字段
  position: string;    // 从Case对象获取的字段
  revisionCount: number;
}

export interface QuestionCreateRequest {
  caseID: number;
  questionText: string;
  answer: string;
  source: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export const questionService = {
  getQuestions: async (
    page: number = 1,
    pageSize: number = 10,
    sortBy?: string,
    filter?: Record<string, any>
  ): Promise<PaginatedResponse<Question>> => {
    let queryParams = `?PageNumber=${page}&PageSize=${pageSize}`;
    
    if (sortBy) {
      queryParams += `&SortBy=${sortBy}`;
    }
    
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams += `&${key}=${value}`;
        }
      });
    }
    
    return apiRequest(`/Question${queryParams}`);
  },
  
  getQuestionById: async (id: number): Promise<Question> => {
    return apiRequest(`/Question/${id}`);
  },
  
  createQuestion: async (question: QuestionCreateRequest): Promise<{ questionId: number, message: string }> => {
    return apiRequest("/Question", "POST", question);
  },
  
  updateQuestion: async (id: number, question: { questionText?: string, answer?: string }): Promise<{ message: string }> => {
    return apiRequest(`/Question/${id}`, "PUT", question);
  },
  
  deleteQuestion: async (id: number): Promise<{ message: string }> => {
    return apiRequest(`/Question/${id}`, "DELETE");
  },
  
  addRevision: async (
    questionId: number, 
    revision: { revisionText: string, type: number, comments?: string }
  ): Promise<{ revisionId: number, message: string }> => {
    return apiRequest(`/Question/${questionId}/revisions`, "POST", revision);
  },
  
  getRevisions: async (questionId: number): Promise<any[]> => {
    return apiRequest(`/Question/${questionId}/revisions`);
  },
  
  approveQuestion: async (
    questionId: number, 
    status: number, 
    comments?: string
  ): Promise<{ message: string }> => {
    return apiRequest(`/Question/${questionId}/approve`, "POST", { status, comments });
  }
};