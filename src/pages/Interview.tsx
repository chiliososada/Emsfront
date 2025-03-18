import React, { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/interview/QuestionCard';
import { QuestionForm } from '@/components/interview/QuestionForm';
import { Button } from '@/components/ui/button';
import { Search, Filter, Check, X, AlertCircle, RefreshCw, ListFilter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  
  // 跟踪当前激活的过滤器类型
  const [activeFilterType, setActiveFilterType] = useState<'status' | 'position' | null>(null);
  
  // 用于跟踪活跃的职位
  const [positions, setPositions] = useState<string[]>([]);
  
  // 获取职位列表
  const fetchPositions = async () => {
    try {
      setLoading(true);
      
      const positionList = await caseService.getPositions();
      
      if (Array.isArray(positionList) && positionList.length > 0) {
        setPositions(positionList);
      } else {
        console.log('没有返回关键字数据或数据为空');
      }
    } catch (error) {
      console.error('获取关键字列表失败:', error);
      toast({
        title: "获取关键字列表失败",
        description: "将使用已缓存的关键字数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      
      // 根据激活的过滤器类型应用过滤条件
      if (activeFilterType === 'status' && statusFilter.length > 0) {
        const statusValues = statusFilter.map(status => statusToNumber(status));
        filter.Status = statusValues[0];
      } else if (activeFilterType === 'position' && positionFilter.length > 0 && positionFilter[0] !== '') {
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
  
  // 修改后的职位过滤切换函数，实现互斥过滤
  const togglePositionFilter = (position: string) => {
    // 如果点击的是已选中的关键字，则取消选择
    if (activeFilterType === 'position' && positionFilter.includes(position)) {
      setPositionFilter([]);
      setActiveFilterType(null);
    } else {
      // 否则设置关键字过滤并激活关键字过滤器类型
      setPositionFilter([position]);
      setActiveFilterType('position');
      // 清空状态过滤
      setStatusFilter([]);
    }
  };
  
  // 修改后的状态过滤切换函数，实现互斥过滤
  const toggleStatusFilter = (status: string) => {
    // 如果点击的是已选中的状态，则取消选择
    if (activeFilterType === 'status' && statusFilter.includes(status)) {
      setStatusFilter([]);
      setActiveFilterType(null);
    } else {
      // 否则设置状态过滤并激活状态过滤器类型
      setStatusFilter([status]);
      setActiveFilterType('status');
      // 清空关键字过滤
      setPositionFilter([]);
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
        {/* 页面标题区域 */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 shadow-sm border border-primary/10">
          <h1 className="text-3xl font-bold tracking-tight">面试问题库</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            浏览、添加和讨论面试问题，提高您的面试技巧和知识储备
          </p>
        </div>
        
        {/* 问题表单区域 */}
        <div className="transition-all duration-300 hover:shadow-md">
          <QuestionForm onSuccess={() => {
            refreshQuestions();
            fetchPositions(); // 添加问题后刷新职位列表
          }} />
        </div>
        
        {/* 搜索和过滤器区域 */}
        <Card className="shadow-sm border-primary/5 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <SlidersHorizontal size={18} className="mr-2" />
              搜索与过滤
            </CardTitle>
            <CardDescription>
              使用下方选项查找特定的面试问题
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="搜索问题内容或关键词..."
                  className="pl-9 transition-all duration-300 border-primary/20 focus:border-primary"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Button 
                type="button" 
                variant="outline"
                onClick={refreshQuestions}
                className="sm:flex-shrink-0 transition-all duration-300 hover:bg-primary/10"
              >
                <RefreshCw size={16} className="mr-2" />
                刷新列表
              </Button>
            </form>
            
            <Separator className="my-2" />
            
            {/* 过滤器选项区域 */}
            <div className="bg-muted/30 p-4 rounded-lg space-y-3">
              {/* 关键字过滤器 */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2 bg-background p-1.5 px-3 rounded-full shadow-sm">
                  <Filter size={14} className="text-primary" />
                  <span className="text-sm font-medium">关键字:</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {positions.length > 0 ? (
                    positions.map((position) => (
                      <Badge
                        key={position}
                        variant={activeFilterType === 'position' && positionFilter.includes(position) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all duration-300 hover:shadow-sm hover:scale-105 active:scale-95"
                        onClick={() => togglePositionFilter(position)}
                      >
                        {position || '未分类'}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">无关键字数据</span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 bg-background p-1.5 px-3 rounded-full shadow-sm">
                  <ListFilter size={14} className="text-primary" />
                  <span className="text-sm font-medium">状态:</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <Badge
                    variant={activeFilterType === 'status' && statusFilter.includes('approved') ? 'default' : 'outline'}
                    className="cursor-pointer flex gap-1 items-center transition-all duration-300 hover:shadow-sm hover:scale-105 active:scale-95"
                    onClick={() => toggleStatusFilter('approved')}
                  >
                    <Check size={12} />
                    已批准
                  </Badge>
                  <Badge
                    variant={activeFilterType === 'status' && statusFilter.includes('pending') ? 'default' : 'outline'}
                    className="cursor-pointer flex gap-1 items-center transition-all duration-300 hover:shadow-sm hover:scale-105 active:scale-95"
                    onClick={() => toggleStatusFilter('pending')}
                  >
                    <AlertCircle size={12} />
                    待审核
                  </Badge>
                  <Badge
                    variant={activeFilterType === 'status' && statusFilter.includes('rejected') ? 'default' : 'outline'}
                    className="cursor-pointer flex gap-1 items-center transition-all duration-300 hover:shadow-sm hover:scale-105 active:scale-95"
                    onClick={() => toggleStatusFilter('rejected')}
                  >
                    <X size={12} />
                    已拒绝
                  </Badge>
                </div>
              </div>
              
              {/* 显示当前过滤条件 */}
              {(activeFilterType || searchQuery) && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <span className="text-muted-foreground">当前过滤:</span>
                  {activeFilterType === 'position' && positionFilter.length > 0 && (
                    <Badge variant="secondary" className="flex gap-1 items-center">
                      关键字: {positionFilter[0]}
                      <X 
                        size={12} 
                        className="cursor-pointer ml-1 hover:text-destructive" 
                        onClick={() => {
                          setPositionFilter([]);
                          setActiveFilterType(null);
                        }}
                      />
                    </Badge>
                  )}
                  {activeFilterType === 'status' && statusFilter.length > 0 && (
                    <Badge variant="secondary" className="flex gap-1 items-center">
                      状态: {statusFilter[0] === 'approved' ? '已批准' : statusFilter[0] === 'rejected' ? '已拒绝' : '待审核'}
                      <X 
                        size={12} 
                        className="cursor-pointer ml-1 hover:text-destructive" 
                        onClick={() => {
                          setStatusFilter([]);
                          setActiveFilterType(null);
                        }}
                      />
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="secondary" className="flex gap-1 items-center">
                      搜索: {searchQuery}
                      <X 
                        size={12} 
                        className="cursor-pointer ml-1 hover:text-destructive" 
                        onClick={() => setSearchQuery('')}
                      />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* 问题列表区域 */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-background rounded-lg border border-primary/5 shadow-sm">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-muted-foreground animate-pulse">加载问题列表中...</p>
            </div>
          ) : (
            <>
              {questions.length > 0 ? (
                <div className="grid gap-4 animate-fade-in">
                  {/* 结果统计 */}
                  <div className="text-sm text-muted-foreground mb-2 pl-2">
                    找到 {totalCount} 个相关问题
                  </div>
                  
                  {questions.map((question) => (
                    <QuestionCard 
                      key={question.questionID} 
                      question={mapQuestionToCardProps(question)}
                      onStatusChange={refreshQuestions}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 bg-background rounded-lg border border-primary/5 shadow-sm animate-fade-in">
                  <div className="rounded-full bg-muted p-4 mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">未找到问题</h3>
                  <p className="text-muted-foreground text-center max-w-lg mb-4">
                    我们找不到符合搜索条件的面试问题。请尝试调整过滤条件或添加新问题。
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPositionFilter([]);
                      setStatusFilter([]);
                      setSearchQuery('');
                      setActiveFilterType(null);
                      refreshQuestions();
                    }}
                  >
                    清除所有过滤条件
                  </Button>
                </div>
              )}
            </>
          )}
          
          {/* 分页控件 */}
          {!loading && questions.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-8">
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
                          className="transition-all duration-200 hover:scale-110 active:scale-95"
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
          
          {!loading && questions.length > 0 && (
            <div className="text-center text-sm text-muted-foreground mt-2 mb-8">
              第 {currentPage} 页 / 共 {totalPages} 页
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;