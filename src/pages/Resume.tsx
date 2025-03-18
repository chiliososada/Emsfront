import React, { useState, useEffect, useCallback } from 'react';
import { ResumeCard } from '@/components/resume/ResumeCard';
import { ResumeUpload } from '@/components/resume/ResumeUpload';
import { Button } from '@/components/ui/button';
import { Search, Filter, DownloadCloud, Plus, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ResumeViewModal from '@/components/resume/ResumeViewModal';
import { useToast } from '@/hooks/use-toast';
import { resumeService, Resume, Comment } from '@/services/resumeService';

const ResumePage = () => {
  // 状态定义
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  // 在组件挂载后设置mounted状态，防止因SSR不匹配导致的闪烁问题
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 获取简历列表 - 使用useCallback减少不必要的重新创建
  const fetchResumes = useCallback(async () => {
    // 如果组件已卸载，不执行任何操作
    if (!mounted) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await resumeService.getResumes();
      
      // 如果组件已卸载，不更新状态
      if (!mounted) return;
      
      // 安全地处理数据 - 防御性编程
      const safeData = Array.isArray(data) ? data : [];
      
      // 处理日期字段 - 将所有日期字符串转为Date对象，增加健壮性处理
      const processedData = safeData.map(resume => {
        try {
          // 确保有uploadedAt并且是有效日期字符串
          const uploadDate = resume.uploadedAt 
            ? new Date(resume.uploadedAt.toString().endsWith('Z') 
                ? resume.uploadedAt.toString() 
                : resume.uploadedAt.toString() + 'Z')
            : new Date();
          
          // 确保comments存在且是数组
          const safeComments = Array.isArray(resume.comments) 
            ? resume.comments 
            : [];
          
          // 处理评论中的日期
          const processedComments = safeComments.map(comment => {
            try {
              return {
                ...comment,
                // 处理可能的日期格式问题
                createdAt: comment.createdAt 
                  ? new Date(comment.createdAt.toString().endsWith('Z') 
                      ? comment.createdAt.toString() 
                      : comment.createdAt.toString() + 'Z')
                  : new Date()
              };
            } catch (e) {
              // 如果评论日期处理失败，使用当前日期
              return {
                ...comment,
                createdAt: new Date()
              };
            }
          });
          
          return {
            ...resume,
            uploadedAt: uploadDate,
            comments: processedComments
          };
        } catch (e) {
          // 如果单个简历处理失败，使用安全值代替
          console.error('处理简历数据错误:', e);
          return {
            ...resume,
            uploadedAt: new Date(),
            comments: []
          };
        }
      });
      
      setResumes(processedData);
    } catch (error) {
      console.error('获取简历列表失败:', error);
      
      // 如果组件已卸载，不更新状态
      if (!mounted) return;
      
      setError('无法加载简历列表，请重试');
      toast({
        title: "获取失败",
        description: "无法获取简历列表，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      // 如果组件已卸载，不更新状态
      if (!mounted) return;
      setLoading(false);
    }
  }, [toast, mounted]);

  // 组件挂载和refreshTrigger变化时重新获取数据
  useEffect(() => {
    if (mounted) {
      fetchResumes();
    }
  }, [fetchResumes, refreshTrigger, mounted]);

  // 处理过滤器切换
  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters(current => {
      if (current.includes(filter)) {
        return current.filter(f => f !== filter);
      } else {
        return [...current, filter];
      }
    });
  }, []);

  // 过滤简历列表
  const filteredResumes = React.useMemo(() => {
    return resumes.filter(resume => {
      const matchesSearch = searchQuery
        ? (resume.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           resume.fileName?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;

      const matchesFilters = activeFilters.length === 0 || 
                            activeFilters.includes(resume.status);

      return matchesSearch && matchesFilters;
    });
  }, [resumes, searchQuery, activeFilters]);

  // 处理查看简历
  const handleViewResume = useCallback((resume: Resume) => {
    setSelectedResume(resume);
    setShowViewModal(true);
  }, []);

  // 处理状态变更
  const handleStatusChange = useCallback((resumeId: string, newStatus: Resume['status']) => {
    setResumes(currentResumes => 
      currentResumes.map(resume => {
        if (resume.id === resumeId) {
          return { ...resume, status: newStatus };
        }
        return resume;
      })
    );

    if (selectedResume && selectedResume.id === resumeId) {
      setSelectedResume(current => 
        current ? { ...current, status: newStatus } : null
      );
    }

    toast({
      title: "状态已更新",
      description: `简历状态已更新为${
        newStatus === 'approved' ? '已批准' : 
        newStatus === 'reviewed' ? '已审阅' : '待审核'
      }。`,
    });

    // 触发刷新
    setRefreshTrigger(prev => prev + 1);
    
    // 关闭模态框
    setShowViewModal(false);
  }, [selectedResume, toast]);

  // 处理添加评论
  const handleAddComment = useCallback((resumeId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      content,
      createdBy: 'Current User',
      createdAt: new Date(),
    };

    setResumes(currentResumes => 
      currentResumes.map(resume => {
        if (resume.id === resumeId) {
          const updatedComments = resume.comments 
            ? [...resume.comments, newComment] 
            : [newComment];
          return { ...resume, comments: updatedComments };
        }
        return resume;
      })
    );

    if (selectedResume && selectedResume.id === resumeId) {
      setSelectedResume(current => {
        if (!current) return null;
        
        const updatedComments = current.comments
          ? [...current.comments, newComment]
          : [newComment];
        return { ...current, comments: updatedComments };
      });
    }

    toast({
      title: "评论已添加",
      description: "您的评论已添加到简历。",
    });
    
    // 触发刷新
    setRefreshTrigger(prev => prev + 1);
  }, [toast]);

  // 处理下载模板
  const handleDownloadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      // 文件名
      const fileName = "resume_template.xlsx";

      // 使用FileController的下载端点
      const response = await fetch(`/api/File/templates/${fileName}`);

      if (!response.ok) {
        throw new Error('下载失败');
      }

      // 获取文件数据并创建Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // 创建下载链接并触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('获取模板失败:', error);
      toast({
        title: "获取模板失败",
        description: "无法获取简历模板，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 手动刷新数据
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 如果组件未挂载，返回null避免任何渲染
  if (!mounted) return null;

  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">简历</h1>
            <p className="text-muted-foreground mt-1">
              上传、管理和审阅简历
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleDownloadTemplate}
              disabled={loading}
            >
              <DownloadCloud size={16} />
              模板
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              刷新
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? <X size={16} /> : <Plus size={16} />}
              {showUpload ? '取消' : '上传简历'}
            </Button>
          </div>
        </div>

        {/* 上传表单 */}
        {showUpload && (
          <div className="animate-fade-in">
            <ResumeUpload onUploadSuccess={() => setRefreshTrigger(prev => prev + 1)} />
          </div>
        )}

        {/* 搜索和过滤 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="搜索简历..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter size={16} className="text-muted-foreground" />
              <div className="flex gap-2">
                {['pending', 'reviewed', 'approved'].map((status) => (
                  <Badge
                    key={status}
                    variant={activeFilters.includes(status) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleFilter(status)}
                  >
                    {{
                      'pending': '待审核',
                      'reviewed': '已审阅',
                      'approved': '已批准'
                    }[status]}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* 简历列表 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 border border-border rounded-lg p-4">
            {error ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-destructive/10 p-3 mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-medium">加载失败</h3>
                <p className="text-muted-foreground mt-1 mb-4">{error}</p>
                <Button onClick={handleRefresh}>重试</Button>
              </div>
            ) : loading ? (
              <div className="col-span-full flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {filteredResumes.length > 0 ? (
                  filteredResumes.map((resume) => (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      onView={() => handleViewResume(resume)}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">没有找到简历</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      未找到匹配的简历。尝试调整过滤条件或上传新的简历。
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* 查看模态框 */}
      {selectedResume && (
        <ResumeViewModal
          resume={selectedResume}
          open={showViewModal}
          onOpenChange={setShowViewModal}
          onStatusChange={handleStatusChange}
          onAddComment={handleAddComment}
        />
      )}
    </div>
  );
};

export default ResumePage;