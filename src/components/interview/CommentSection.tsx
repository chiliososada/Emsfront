import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Send } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment?: (comment: string) => void;
  isLoading?: boolean;
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

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  isLoading = false
}) => {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (commentText.trim() && onAddComment) {
      setIsSubmitting(true);
      try {
        await onAddComment(commentText);
        setCommentText('');
        setShowCommentForm(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{comment.createdBy}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 mt-1">
                  <p className="text-sm">{comment.content}</p>
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
                  添加答案
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          onClick={() => setShowCommentForm(true)}
        >
          <Send size={14} className="mr-1" />
          添加答案
        </Button>
      )}
    </>
  );
};