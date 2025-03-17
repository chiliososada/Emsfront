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
  FileDown,
  Eye,
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

export const ResumeViewModal: React.FC<ResumeViewModalProps> = ({
  resume,
  open,
  onOpenChange,
  onStatusChange,
  onAddComment,
}) => {
  const [currentStatus, setCurrentStatus] = useState<Resume['status']>(resume.status);
  const [newComment, setNewComment] = useState('');

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as Resume['status']);
  };

  const saveChanges = async () => {
    try {
      // 使用 reviewResume 方法同时更新状态和可能的评论
      await resumeService.reviewResume(
        resume.id, 
        currentStatus, 
        newComment.trim() || undefined
      );
      
      // 更新本地状态
      onStatusChange(resume.id, currentStatus);
      
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
    } catch (error) {
      console.error("更新简历失败:", error);
      toast({
        title: "更新失败",
        description: "无法更新简历，请重试。",
        variant: "destructive"
      });
    }
  };

  // const handleAddComment = () => {
  //   if (newComment.trim() && onAddComment) {
  //     onAddComment(resume.id, newComment.trim());
  //     setNewComment('');
  //   }
  // };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await resumeService.downloadResume(resume.fileUrl, resume.fileName);
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        title: "下载失败",
        description: "无法下载文件，请稍后重试。",
        variant: "destructive",
      });
    }
  };

  const handleView = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      // 对于PDF文件，我们可以在新窗口中打开
      if (resume.fileName.toLowerCase().endsWith('.pdf')) {
        const url = resume.fileUrl.startsWith('http') ? resume.fileUrl : `${window.location.origin}${resume.fileUrl}`;
        window.open(url, '_blank');
      } else {
        // 对于其他文件，下载后查看
        await resumeService.downloadResume(resume.fileUrl, resume.fileName);
      }
    } catch (error) {
      console.error('查看文件失败:', error);
      toast({
        title: "查看失败",
        description: "无法查看文件，请稍后重试。",
        variant: "destructive",
      });
    }
  };

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
            <Select value={currentStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">待审核</SelectItem>
                <SelectItem value="reviewed">已审阅</SelectItem>
                <SelectItem value="approved">已批准</SelectItem>
              </SelectContent>
            </Select>
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
          {/* <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">评价</span>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-2">
              {resume.comments && resume.comments.length > 0 ? (
                resume.comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/50 rounded-md p-2">
                    <div className="text-sm font-medium">{comment.createdBy}</div>
                    <div className="text-sm">{comment.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDate(comment.createdAt)}
                    </div>
                  </div>
                )
              )
              ) : (
                <p className="text-sm text-muted-foreground">暂无评价</p>
              )}
            </div>
          </div> */}

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">添加评价并修改状态</span>
            <div className="flex gap-2">
              <Textarea 
                placeholder="请评价..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[200px] resize-none"
              />
            </div>
            <Button 
              onClick={saveChanges} 
              className="w-full flex items-center gap-2"
              disabled={!newComment.trim()}
            >
              <Send size={16} />
              提交评价和状态
            </Button>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          {/* <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleView}
            >
              <Eye size={16} />
              查看
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-1"
              onClick={handleDownload}
            >
              <FileDown size={16} />
              下载
            </Button>
          </div> */}
          {/* <Button onClick={saveChanges}>保存状态或评价</Button> */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};