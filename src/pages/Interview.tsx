import React, { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { QuestionForm } from '@/components/interview/QuestionForm';
import { Button } from '@/components/ui/button';
import { Search, Filter, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { questionService, Question } from '@/services/questionService';
import { caseService } from '@/services/caseService';
import { toast } from '@/components/ui/use-toast';

// 确保状态映射正确: 0 = 待审核, 1 = 已批准, 2 = 已拒绝
const statusToNumber = (status: string | number): number => {
  if (typeof status === 'number') {
    return status;
  }
  
  switch (status.toLowerCase()) {
    case 'approved': return 1;
    case 'rejected': return 2;
    case 'pending':
    default: return 0;
  }
};

const statusToText = (status: number): string => {
  switch (status) {
    case 1: return '已批准';
    case 2: return '已拒绝';
    case 0:
    default: return '待审核';
  }
};

const InterviewPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // 用于跟踪活跃的职位
  const [positions, setPositions] = useState<string[]>([]);
  
  // 获取职位列表
  const fetchPositions = async () => {
    try {
      setLoading(true); // 或者你可能有专门的 setLoadingPositions 状态
      
      // 直接调用新添加的API方法
      const positionList = await caseService.getPositions();
      
      if (Array.isArray(positionList) && positionList.length > 0) {
        setPositions(positionList);
      } else {
        // 如果返回空数组，保留可能已有的职位数据
        console.log('没有返回关键字数据或数据为空');
      }
    } catch (error) {
      console.error('获取关键字列表失败:', error);
      // 显示错误通知
      toast({
        title: "获取关键字列表失败",
        description: "将使用关键字数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false); // 或者 setLoadingPositions(false)
    }
  };
  
  // 组件挂载时获取职位列表
  useEffect(() => {
    fetchPositions();
  }, []);
  
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      const filter: Record<string, any> = {};
      
      // 搜索关键词
      if (searchQuery) {
        filter.Keyword = searchQuery;
      }
      
      // 状态过滤 - 确保转换为正确的数字值
      if (statusFilter.length > 0) {
        const statusValues = statusFilter.map(status => statusToNumber(status));
        
        if (statusValues.length === 1) {
          filter.Status = statusValues[0];
        }
      }
      
      // 职位过滤
      if (positionFilter.length > 0 && positionFilter[0] !== '') {
        filter.Position = positionFilter.join(',');
      }
      
      // 获取问题列表
      const response = await questionService.getQuestions(
        currentPage,
        pageSize,
        'CreatedAt', // 默认按创建时间排序
        filter
      );
      
      setQuestions(response.items);
      setTotalPages(response.pageCount);
      setTotalCount(response.totalCount);
      
      // 提取并更新可能的新职位
      const extractedPositions = Array.from(
        new Set(
          response.items
            .map(q => q.position)
            .filter(p => p && p.trim() !== '')
        )
      );
      
      // 合并已有的和新提取的职位，并去重
      setPositions(prevPositions => {
        const combinedPositions = [...prevPositions, ...extractedPositions];
        return Array.from(new Set(combinedPositions)).filter(Boolean);
      });
      
    } catch (error) {
      console.error('加载问题列表失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载问题列表，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载和刷新时获取问题
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, pageSize, refreshTrigger]);
  
  // 当过滤条件改变时重置到第一页并重新加载
  useEffect(() => {
    setCurrentPage(1);
    fetchQuestions();
  }, [statusFilter, positionFilter, searchQuery]);
  
  const togglePositionFilter = (position: string) => {
    if (positionFilter.includes(position)) {
      setPositionFilter(positionFilter.filter(p => p !== position));
    } else {
      setPositionFilter([...positionFilter, position]);
    }
  };
  
  const toggleStatusFilter = (status: string) => {
    if (statusFilter.includes(status)) {
      setStatusFilter(statusFilter.filter(s => s !== status));
    } else {
      setStatusFilter([...statusFilter, status]);
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };
  
  const refreshQuestions = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  // 根据问题对象构建卡片所需的数据
  const mapQuestionToCardProps = (question: Question) => {
    return {
      id: question.questionID.toString(),
      question: question.questionText,
      answer: question.answer || "",
      category: question.caseName || "未分类",
      company: question.companyName,
      position: question.position || "",
      isInternal: question.source === 1, // 1 = Company, 0 = Personal
      status: typeof question.status === 'number' ? question.status : statusToNumber(question.status),
      createdBy: question.username || "匿名用户",
      createdAt: new Date(question.createdAt),
      comments: [], // 评论通常需要额外请求
    };
  };

  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">面试问题</h1>
          <p className="text-muted-foreground mt-1">
            浏览、添加和讨论面试问题
          </p>
        </div>
        
        <QuestionForm onSuccess={() => {
          refreshQuestions();
          fetchPositions(); // 添加问题后刷新职位列表
        }} />
        
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="搜索问题..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Button 
              type="button" 
              variant="outline"
              onClick={refreshQuestions}
              className="sm:flex-shrink-0"
            >
              <RefreshCw size={16} className="mr-2" />
              刷新
            </Button>
          </form>
          
          {/* 关键字过滤器 */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">关键字:</span>
            <div className="flex flex-wrap gap-2">
              {positions.length > 0 ? (
                positions.map((position) => (
                  <Badge
                    key={position}
                    variant={positionFilter.includes(position) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => togglePositionFilter(position)}
                  >
                    {position || '未分类'}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">无关键字数据</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">状态:</span>
            <div className="flex gap-2">
              <Badge
                variant={statusFilter.includes('approved') ? 'default' : 'outline'}
                className="cursor-pointer flex gap-1 items-center"
                onClick={() => toggleStatusFilter('approved')}
              >
                <Check size={12} />
                已批准
              </Badge>
              <Badge
                variant={statusFilter.includes('pending') ? 'default' : 'outline'}
                className="cursor-pointer flex gap-1 items-center"
                onClick={() => toggleStatusFilter('pending')}
              >
                <AlertCircle size={12} />
                待审核
              </Badge>
              <Badge
                variant={statusFilter.includes('rejected') ? 'default' : 'outline'}
                className="cursor-pointer flex gap-1 items-center"
                onClick={() => toggleStatusFilter('rejected')}
              >
                <X size={12} />
                已拒绝
              </Badge>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {questions.length > 0 ? (
                questions.map((question) => (
                  <QuestionCard 
                    key={question.questionID} 
                    question={mapQuestionToCardProps(question)}
                    onStatusChange={refreshQuestions}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">未找到问题</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    我们找不到符合搜索条件的面试问题。请尝试调整过滤条件或添加新问题。
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* 分页控件 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                    let pageNumber;
                    
                    if (totalPages <= 5) {
                      pageNumber = index + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                    
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          <div className="text-center text-sm text-muted-foreground">
            共 {totalCount} 个问题，第 {currentPage} 页 / 共 {totalPages} 页
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;