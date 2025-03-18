import React, { useState } from 'react';
import { Resume, Comment } from '@/services/resumeService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Send,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { resumeService } from '@/services/resumeService';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface ResumeViewModalProps {
  resume: Resume;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (resumeId: string, status: Resume['status']) => void;
  onAddComment?: (resumeId: string, comment: string) => void;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const getStatusIcon = (status: Resume['status']) => {
  switch (status) {
    case 'approved':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'reviewed':
      return <Clock size={16} className="text-blue-500" />;
    default:
      return <Clock size={16} className="text-yellow-500" />;
  }
};

const getStatusColor = (status: Resume['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'reviewed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
};

const ResumeViewModal: React.FC<ResumeViewModalProps> = ({
  resume,
  open,
  onOpenChange,
  onStatusChange,
  onAddComment,
}) => {
  const [currentStatus, setCurrentStatus] = useState<Resume['status']>(resume.status);
  const [newComment, setNewComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // 获取当前用户信息
  const { user } = useAuth();
  // 判断用户是否为学生（userType === 0）
  const isStudent = user?.userType === 0;

  // 当resume属性更新时，确保内部状态也更新
  React.useEffect(() => {
    setCurrentStatus(resume.status);
  }, [resume]);

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as Resume['status']);
  };

  const saveChanges = async () => {
    // 如果是学生用户，直接返回不执行任何操作
    if (isStudent) {
      toast({
        title: "权限不足",
        description: "当前用户无法修改简历状态或添加评价",
        variant: "destructive"
      });
      return;
    }
    
    if (isSaving) return; // 防止重复提交
    
    try {
      setIsSaving(true);
      
      // 使用 reviewResume 方法同时更新状态和可能的评论
      await resumeService.reviewResume(
        resume.id, 
        currentStatus, 
        newComment.trim() || undefined
      );
      
      // 通过回调函数通知父组件状态已更改
      onStatusChange(resume.id, currentStatus);
      
      // 显示成功消息 (父组件也会显示，但为了安全起见)
      toast({
        title: "简历审核成功",
        description: "简历状态和评价已更新。"
      });

      // 如果有新评论，也触发评论更新
      if (newComment.trim() && onAddComment) {
        onAddComment(resume.id, newComment.trim());
      }

      // 清空评论输入
      setNewComment('');
      
      // 自动关闭模态框
      onOpenChange(false);
    } catch (error) {
      console.error("更新简历失败:", error);
      toast({
        title: "更新失败",
        description: "无法更新简历，请重试。",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // 已移除下载和查看功能

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={18} /> {resume.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">文件名</span>
            <span className="text-sm text-muted-foreground">{resume.fileName}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">上传时间</span>
            <span className="text-sm text-muted-foreground">{formatDate(resume.uploadedAt)}</span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">当前状态</span>
            <Badge className={`w-fit ${getStatusColor(resume.status)}`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(resume.status)}
                {{
                  'pending': '待审核',
                  'reviewed': '已审阅',
                  'approved': '已批准'
                }[resume.status]}
              </span>
            </Badge>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">修改状态</span>
            <Select 
              value={currentStatus} 
              onValueChange={handleStatusChange}
              disabled={isStudent}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="reviewed">已审阅</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
              </SelectContent>
            </Select>
            {isStudent && (
              <p className="text-xs text-muted-foreground mt-1">当前用户无法修改简历状态</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">最新评价</span>
            <div className="border rounded-md p-3">
              {resume.comments && resume.comments.length > 0 ? (
                <div className="bg-muted/50 rounded-md p-3">
                  <div className="text-sm font-medium mb-2">
                    {resume.comments[resume.comments.length - 1].createdBy}
                  </div>
                  <div className="text-base font-normal leading-relaxed">
                    {resume.comments[resume.comments.length - 1].content}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {formatDate(resume.comments[resume.comments.length - 1].createdAt)}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">暂无评价</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">添加评价并修改状态</span>
            <div className="flex gap-2">
              <Textarea 
                placeholder={isStudent ? "当前用户无法添加评价" : "请评价..."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isStudent}
              />
            </div>
            <Button 
              onClick={saveChanges} 
              className="w-full flex items-center gap-2"
              disabled={isSaving || isStudent}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-1"></div>
                  提交中...
                </>
              ) : (
                <>
                  <Send size={16} />
                  提交评价和状态
                </>
              )}
            </Button>
            {isStudent && (
              <p className="text-xs text-muted-foreground text-center mt-1">
                当前用户无法添加评价或修改状态
              </p>
            )}
          </div>
        </div>

        {/* 移除了查看和下载按钮 */}
      </DialogContent>
    </Dialog>
  );
};

export default ResumeViewModal;