// src/pages/Attendance.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Calendar, Download, Plus, RefreshCw, Search, X } from 'lucide-react';
import { 
  attendanceService, 
  Attendance, 
  getStatusText 
} from '@/services/attendanceService';
import { AttendanceUpload } from '@/components/attendance/AttendanceUpload';
import { AttendanceCard } from '@/components/attendance/AttendanceCard';
import { AttendanceReviewDialog } from '@/components/attendance/AttendanceReviewDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AttendancePage = () => {
  const { user } = useAuth();
  const isTeacherOrAdmin = user?.userType === 1 || user?.userType === 2; // 1=Teacher, 2=Admin
  
  // 状态管理
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [searchMonth, setSearchMonth] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('uploadDate');
  const [sortDirection, setSortDirection] = useState<string>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  
  // 对话框状态
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [processingAction, setProcessingAction] = useState(false);
  
  // 审核状态
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [statusToSet, setStatusToSet] = useState<number | null>(null);
  
  // 获取勤务表数据
  const fetchAttendances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 构建过滤条件
      const filters: { month?: string; status?: number; userId?: number } = {};
      
      if (searchMonth) {
        filters.month = searchMonth;
      }
      
      if (statusFilter !== 'all') {
        filters.status = parseInt(statusFilter);
      }
      
      // 调用API获取数据
      const response = await attendanceService.getAttendances(
        currentPage,
        pageSize,
        sortBy,
        sortDirection,
        filters
      );
      
      // 数据转换和处理 - 确保工时和交通费字段正确
      const processedItems = response.items.map(item => ({
        ...item,
        // 确保数字字段为数字类型
        workHours: typeof item.workHours === 'string' ? parseFloat(item.workHours) : (item.workHours || 0),
        transportationFee: typeof item.transportationFee === 'string' ? parseFloat(item.transportationFee) : (item.transportationFee || 0)
      }));
      
      setAttendances(processedItems);
      setTotalPages(Math.max(1, response.pageCount));
    } catch (error) {
      console.error('获取勤务表列表失败:', error);
      setError('无法加载勤务表列表，请重试');
      toast({
        title: "加载失败",
        description: "无法获取勤务表列表数据",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDirection, statusFilter, searchMonth]);
  
  // 组件加载时获取数据
  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);
  
  // 处理下载模板
  const handleDownloadTemplate = async (type: 'attendance' | 'transportation') => {
    try {
      setLoading(true);
      await attendanceService.downloadTemplate(type);
      toast({
        title: "下载成功",
        description: `${type === 'attendance' ? '勤务表' : '交通费'}模板已下载`
      });
    } catch (error) {
      toast({
        title: "下载失败",
        description: `无法下载${type === 'attendance' ? '勤务表' : '交通费'}模板`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // 打开删除对话框
  const handleOpenDeleteDialog = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setShowDeleteDialog(true);
  };
  
  // 处理删除
  const handleDelete = async () => {
    if (!selectedAttendance) return;
    
    try {
      setProcessingAction(true);
      await attendanceService.deleteAttendance(selectedAttendance.attendanceID);
      
      toast({
        title: "删除成功",
        description: "勤务表已成功删除"
      });
      
      // 刷新列表
      fetchAttendances();
    } catch (error) {
      console.error('删除勤务表失败:', error);
      toast({
        title: "删除失败",
        description: "无法删除勤务表，请重试",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setShowDeleteDialog(false);
      setSelectedAttendance(null);
    }
  };
  
  // 打开审核对话框
  const handleOpenReviewDialog = (attendance: Attendance, status: number) => {
    setSelectedAttendance(attendance);
    setStatusToSet(status);
    setShowReviewDialog(true);
  };
  
  // 处理审核
  const handleReview = async (attendance: Attendance, status: number, comments: string) => {
    try {
      setProcessingAction(true);
      await attendanceService.reviewAttendance(attendance.attendanceID, status, comments);
      
      toast({
        title: "审核成功",
        description: `勤务表已${status === 1 ? '批准' : '拒绝'}`
      });
      
      // 刷新列表
      fetchAttendances();
    } catch (error) {
      console.error('审核勤务表失败:', error);
      toast({
        title: "审核失败",
        description: "无法审核勤务表，请重试",
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setShowReviewDialog(false);
      setSelectedAttendance(null);
      setStatusToSet(null);
    }
  };
  
  // 切换页码
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  // 渲染页码按钮
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i} 
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // 显示部分页码
      const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      // 首页
      if (startPage > 1) {
        buttons.push(
          <PaginationItem key={1}>
            <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
          </PaginationItem>
        );
        
        if (startPage > 2) {
          buttons.push(
            <PaginationItem key="ellipsis-start">
              <span className="px-4">...</span>
            </PaginationItem>
          );
        }
      }
      
      // 中间页码
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(
          <PaginationItem key={i}>
            <PaginationLink 
              isActive={currentPage === i} 
              onClick={() => handlePageChange(i)}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
      
      // 末页
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          buttons.push(
            <PaginationItem key="ellipsis-end">
              <span className="px-4">...</span>
            </PaginationItem>
          );
        }
        
        buttons.push(
          <PaginationItem key={totalPages}>
            <PaginationLink onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    return buttons;
  };
  
  return (
    <div className="page-transition">  
      <div className="flex flex-col gap-6">
        {/* 页面标题区域 */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 shadow-sm border border-primary/10">
          <h1 className="text-3xl font-bold tracking-tight">勤务表管理</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            在这里上传和管理您的勤务表和交通费凭证，查看审核状态和详细信息
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant="outline"
              className="bg-white/50 border-primary/20"
              onClick={() => handleDownloadTemplate('attendance')}
            >
              <Download size={16} className="mr-2" />
              下载勤务表模板
            </Button>
            <Button
              variant="outline"
              className="bg-white/50 border-primary/20"
              onClick={() => handleDownloadTemplate('transportation')}
            >
              <Download size={16} className="mr-2" />
              下载交通费模板
            </Button>
            <Button
              className="ml-auto"
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
              {showUpload ? "取消" : "上传勤务表"}
            </Button>
          </div>
        </div>
        
        {/* 上传表单区域 */}
        {showUpload && (
          <div className="animate-in">
            <AttendanceUpload 
              onUploadSuccess={() => {
                setShowUpload(false);
                fetchAttendances();
              }} 
            />
          </div>
        )}
        
        {/* 筛选和排序区域 */}
        <Card className="shadow-sm border-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">筛选与排序</CardTitle>
            <CardDescription>
              使用下方选项筛选和排序勤务表列表
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* 月份筛选 */}
              <div className="space-y-2">
                <Label htmlFor="month-filter">按月份筛选</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="month-filter"
                    type="month"
                    placeholder="选择月份"
                    className="pl-9"
                    value={searchMonth}
                    onChange={(e) => {
                      setSearchMonth(e.target.value);
                      setCurrentPage(1); // 重置到第一页
                    }}
                  />
                  {searchMonth && (
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchMonth('')}
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {/* 状态筛选 */}
              <div className="space-y-2">
                <Label htmlFor="status-filter">按状态筛选</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1); // 重置到第一页
                  }}
                >
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部状态</SelectItem>
                    <SelectItem value="0">待审核</SelectItem>
                    <SelectItem value="1">已批准</SelectItem>
                    <SelectItem value="2">已拒绝</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 排序字段 */}
              <div className="space-y-2">
                <Label htmlFor="sort-by">排序字段</Label>
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    setSortBy(value);
                    setCurrentPage(1); // 重置到第一页
                  }}
                >
                  <SelectTrigger id="sort-by">
                    <SelectValue placeholder="选择排序字段" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uploadDate">上传日期</SelectItem>
                    <SelectItem value="month">勤务月份</SelectItem>
                    <SelectItem value="workHours">勤务时间</SelectItem>
                    <SelectItem value="transportationFee">交通费</SelectItem>
                    <SelectItem value="status">状态</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* 排序方向 */}
              <div className="space-y-2">
                <Label htmlFor="sort-direction">排序方向</Label>
                <Select
                  value={sortDirection}
                  onValueChange={(value) => {
                    setSortDirection(value);
                    setCurrentPage(1); // 重置到第一页
                  }}
                >
                  <SelectTrigger id="sort-direction">
                    <SelectValue placeholder="选择排序方向" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">降序 (新→旧)</SelectItem>
                    <SelectItem value="asc">升序 (旧→新)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 刷新按钮 */}
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => fetchAttendances()}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                刷新列表
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 勤务表列表 */}
        {loading ? (
          <div className="flex justify-center items-center py-20 bg-background rounded-lg border border-primary/5 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
              <p className="text-muted-foreground animate-pulse">加载勤务表中...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background rounded-lg border border-primary/5 shadow-sm">
            <div className="rounded-full bg-destructive/10 p-3 mb-3">
              <X className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-medium">加载失败</h3>
            <p className="text-muted-foreground mt-1 mb-4">{error}</p>
            <Button onClick={() => fetchAttendances()}>重试</Button>
          </div>
        ) : attendances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-background rounded-lg border border-primary/5 shadow-sm">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">没有找到勤务表</h3>
            <p className="text-muted-foreground mt-1 max-w-md text-center">
              {searchMonth || statusFilter !== 'all' 
                ? "没有符合筛选条件的勤务表。尝试调整筛选条件或上传新的勤务表。" 
                : "您还没有上传任何勤务表。点击上方按钮开始上传。"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {attendances.map((attendance) => (
                <AttendanceCard
                  key={attendance.attendanceID}
                  attendance={attendance}
                  isTeacherOrAdmin={isTeacherOrAdmin}
                  onDelete={handleOpenDeleteDialog}
                  onReview={handleOpenReviewDialog}
                />
              ))}
            </div>
            
            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationButtons()}
                    
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
          </>
        )}
      </div>
      
      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>删除勤务表</DialogTitle>
            <DialogDescription>
              您确定要删除此勤务表吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttendance && (
            <div className="py-4">
              <p className="text-sm">
                <span className="font-semibold">勤务月份:</span> {selectedAttendance.month}
              </p>
              <p className="text-sm">
                <span className="font-semibold">上传日期:</span> {new Date(selectedAttendance.uploadDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <span className="font-semibold">状态:</span> {getStatusText(selectedAttendance.status)}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setSelectedAttendance(null);
              }}
              disabled={processingAction}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={processingAction}
            >
              {processingAction ? "处理中..." : "删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* 审核对话框 */}
      <AttendanceReviewDialog
        attendance={selectedAttendance}
        open={showReviewDialog}
        statusToSet={statusToSet}
        onOpenChange={setShowReviewDialog}
        onConfirm={handleReview}
        isLoading={processingAction}
      />
    </div>
  );
};

export default AttendancePage;