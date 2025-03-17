import React, { useState, useEffect } from 'react';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { QuestionMetadata } from './QuestionMetadata';
import { CommentSection } from './CommentSection';
import { formatDate } from './utils';
import { questionService } from '@/services/questionService';
import { toast } from '@/components/ui/use-toast';

// 定义问题对象的接口
export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  category: string;
  company?: string;
  position?: string;
  isInternal: boolean;
  status: number; // 修改为数字类型，对应后端枚举
  createdBy: string;
  createdAt: Date;
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
}

interface QuestionCardProps {
  question: InterviewQuestion;
  onStatusChange?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onStatusChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comments, setComments] = useState<Comment[]>(question.comments || []);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedRevisions, setHasLoadedRevisions] = useState(false);
  const [firstComment, setFirstComment] = useState<Comment | null>(null);

  const toggleExpanded = () => {
    setExpanded(!expanded);

    // 当首次展开时，加载评论/修订数据
    if (!expanded && !hasLoadedRevisions) {
      loadRevisions();
    }
  };

  // 从后端加载问题的评论/修订
  const loadRevisions = async () => {
    try {
      setIsLoading(true);
      const questionId = parseInt(question.id);

      if (isNaN(questionId)) {
        return;
      }

      const revisions = await questionService.getRevisions(questionId);

      // 将修订转换为评论格式
      const newComments: Comment[] = revisions.map(revision => {
        
        return {
        id: revision.revisionID.toString(),
        content: revision.revisionText,
        createdBy: revision.username || "用户",
        createdAt: new Date(revision.createdAt+"Z")
      }});
      
      // 如果有评论，则设置第一条评论
      if (newComments.length > 0) {
        setFirstComment(newComments[0]);
      }

      setComments(newComments);
      setHasLoadedRevisions(true);
    } catch (error) {
      console.error('加载答案失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 在组件挂载时加载修订/评论
  useEffect(() => {
    loadRevisions();
  }, []);

  const handleAddComment = async (commentText: string) => {
    if (!commentText.trim()) return;

    try {
      const questionId = parseInt(question.id);

      if (isNaN(questionId)) {
        throw new Error("问题ID无效");
      }

      // 添加评论到后端
      const response = await questionService.addRevision(questionId, {
        revisionText: commentText,
        type: 2, // 2 = TeacherComment
        comments: "答案"
      });

      // 创建新评论并更新状态
      const newComment: Comment = {
        id: response.revisionId.toString(),
        content: commentText,
        createdBy: "当前用户", // 实际中应该从用户会话获取
        createdAt: new Date()
      };

      setComments(prevComments => [...prevComments, newComment]);

      toast({
        title: "回答已添加",
        description: "您的回答已成功添加。"
      });

      // 如果有状态变更回调则调用
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('添加答案失败:', error);
      toast({
        title: "添加答案失败",
        description: "添加答案时发生错误，请重试。",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="hover-scale glass-card overflow-hidden animate-in">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <QuestionMetadata
                category={question.category}
                company={question.company}
                isInternal={question.isInternal}
                status={question.status}
                questionId={parseInt(question.id)}
                onStatusChange={onStatusChange}
                position={question.position}
              />
              <h3 className="font-medium text-lg leading-tight text-balance">{question.question}</h3>
            </div>
          </div>

          {/* 显示答案部分 - 优先显示第一条评论内容，如果没有则显示原答案 */}
          <div className="mb-3 mt-4 bg-muted/30 p-3 rounded-md">
            { /*  <h4 className="text-sm font-medium mb-1 text-muted-foreground">答案:</h4>*/}
            <div className="text-sm text-foreground">
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                  加载中...
                </div>
              ) : firstComment ? (
                firstComment.content
              ) : (
                question.answer || "暂无答案"
              )}
            </div>

          </div>

          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>由 {question.createdBy} 添加于 {formatDate(question.createdAt)}</span>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCommentForm(!showCommentForm)}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MessageSquare size={16} />
                {comments.length > 0 && comments.length}
              </button>
              <button
                onClick={toggleExpanded}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expanded ? '收起' : '展开'}
              </button>
            </div>
          </div>

          {expanded && (
            <CommentSection
              comments={comments}
              onAddComment={handleAddComment}
              isLoading={isLoading}
            />
          )}

          {showCommentForm && !expanded && (
            <CommentSection
              comments={[]}
              onAddComment={handleAddComment}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};