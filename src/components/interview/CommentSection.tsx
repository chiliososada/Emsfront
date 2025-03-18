import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Send, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { debounce } from 'lodash'; // 需要安装lodash库

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  userType?: number; // 添加用户类型字段，用于区分评论者身份
  type?: number;     // 修订类型：0=Answer, 1=TeacherEdit, 2=TeacherComment
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (comment: string) => Promise<void> | void;  // 修改类型，允许返回Promise或void
  onDeleteComment?: (commentId: string) => Promise<void>;
  isLoading?: boolean;
  questionStatus?: number; // 添加问题状态参数
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// 根据用户类型判断是否为老师或管理员
const isTeacherOrAdmin = (userType?: number): boolean => {
  return userType === 1 || userType === 2; // 1 = Teacher, 2 = Admin
};

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  onDeleteComment,
  isLoading = false,
  questionStatus = 0 // 默认为待审核状态
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // 获取当前用户信息，用于后续判断
  const { user } = useAuth();
  const currentUserType = user?.userType || 0;
  const currentUsername = user?.username || '';

  // 判断当前用户是否可以添加评论
  // 如果是学生(type=0)且问题已批准(status=1)或已拒绝(status=2)，则不能修改答案
  const canAddComment = (): boolean => {
    if (currentUserType === 0 && (questionStatus === 1 || questionStatus === 2)) {
      return false;
    }
    return true;
  };

  // 创建防抖的提交处理函数
  const debouncedSubmit = useCallback(
    debounce(async () => {
      if (commentText.trim() && onAddComment && !isSubmitting) {
        try {
          setIsSubmitting(true);
          await onAddComment(commentText);
          setCommentText('');
          setShowCommentForm(false);
        } finally {
          setIsSubmitting(false);
        }
      }
    }, 500),
    [commentText, onAddComment, isSubmitting]
  );

  const handleAddComment = () => {
    if (isSubmitting) return; // 防止重复提交
    debouncedSubmit();
  };

  // 处理删除评论
  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment || isDeleting) return;
    
    try {
      setIsDeleting(commentId);
      await onDeleteComment(commentId);
      toast({
        title: "删除成功",
        description: "评论已成功删除"
      });
    } catch (error) {
      console.error('删除评论失败:', error);
      toast({
        title: "删除失败",
        description: "删除评论时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(null);
    }
  };

  // 检查用户是否可以删除评论
  const canDeleteComment = (comment: Comment): boolean => {
    // 只有教师或管理员可以删除自己的评论
    return isTeacherOrAdmin(currentUserType) && comment.createdBy === currentUsername;
  };

  // 清除防抖函数
  useEffect(() => {
    return () => {
      debouncedSubmit.cancel();
    };
  }, [debouncedSubmit]);

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center my-4 py-2 animate-fade-in">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : comments.length > 0 ? (
        <div className="mt-4 pt-4 border-t space-y-3 animate-fade-in">
          <h4 className="text-sm font-medium">答案履历</h4>
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-muted text-xs">
                  <User size={14} />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid grid-cols-1 w-full">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.createdBy}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                
                  {/* 添加删除按钮 */}
                  {canDeleteComment(comment) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={isDeleting === comment.id}
                    >
                      {isDeleting === comment.id ? (
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                      ) : (
                        <Trash2 size={14} className="text-red-500" />
                      )}
                    </Button>
                  )}
                </div>
                {/* 根据用户类型和评论类型设置不同的背景色 */}
                <div 
                  className={`rounded-lg p-3 mt-1 grid grid-cols-1 w-full ${
                    // 老师或管理员的评论使用特殊背景色
                    isTeacherOrAdmin(comment.userType) 
                      ? comment.type === 2 
                        ? 'bg-purple-50 border border-purple-200' // 评论类型
                        : 'bg-blue-50 border border-blue-200'     // 答案编辑类型
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-all text-sm">
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showCommentForm ? (
        <div className="mt-4 pt-4 border-t animate-fade-in">
          <Textarea
            placeholder="更新您的答案..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="mb-3 min-h-[80px] w-full"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCommentForm(false)}
              disabled={isSubmitting}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleAddComment}
              disabled={!commentText.trim() || isSubmitting}
              className="flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
                  提交中...
                </>
              ) : (
                <>
                  <Send size={14} />
                  修改答案
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        // 根据用户类型和问题状态决定是否显示"修改答案"按钮
        canAddComment() && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => setShowCommentForm(true)}
          >
            <Send size={14} className="mr-1" />
            修改答案
          </Button>
        )
      )}
    </>
  );
};