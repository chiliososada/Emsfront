import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { questionService } from '@/services/questionService';
import { useAuth } from '@/contexts/AuthContext';

interface StatusBadgeProps {
  status: number; // 使用数字类型表示状态
  questionId: number;
  onStatusChange?: () => void;
}

// 状态枚举: 0 = 待审核, 1 = 已批准, 2 = 已拒绝
export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status: initialStatus, 
  questionId,
  onStatusChange 
}) => {
  const [status, setStatus] = React.useState<number>(initialStatus);
  const [editingStatus, setEditingStatus] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // 获取用户类型
  const { user } = useAuth();
  const userType = user?.userType || 0; // 默认为 student(0)
  const isTeacherOrAdmin = userType === 1 || userType === 2; // 教师(1)或管理员(2)

  const handleStatusChange = async (newStatus: number) => {
    if (isUpdating) return;
    
    try {
      setIsUpdating(true);
      
      // 调用API更新状态
      await questionService.approveQuestion(
        questionId,
        newStatus,
        `状态已更新为 ${
          newStatus === 0 ? '待审核' : 
          newStatus === 1 ? '已批准' : 
          '已拒绝'
        }`
      );
      
      setStatus(newStatus);
      setEditingStatus(false);
      
      toast({
        title: "状态已更新",
        description: `问题状态已更新为${
          newStatus === 1 ? '已批准' : 
          newStatus === 2 ? '已拒绝' : '待审核'
        }`,
      });
      
      // 如果有状态变更回调则调用
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      console.error('更新状态失败:', error);
      toast({
        title: "更新失败",
        description: "无法更新问题状态，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (editingStatus) {
    return (
      <div className="flex gap-1 items-center">
        <Badge 
          className={`cursor-pointer bg-green-50 text-green-700 border-green-200 ${status === 1 ? 'ring-1 ring-green-700' : ''}`}
          onClick={() => handleStatusChange(1)}
        >
          <Check size={12} className="mr-1" />
          已批准
        </Badge>
        <Badge 
          className={`cursor-pointer bg-yellow-50 text-yellow-700 border-yellow-200 ${status === 0 ? 'ring-1 ring-yellow-700' : ''}`}
          onClick={() => handleStatusChange(0)}
        >
          <AlertCircle size={12} className="mr-1" />
          待审核
        </Badge>
        <Badge 
          className={`cursor-pointer bg-red-50 text-red-700 border-red-200 ${status === 2 ? 'ring-1 ring-red-700' : ''}`}
          onClick={() => handleStatusChange(2)}
        >
          <X size={12} className="mr-1" />
          已拒绝
        </Badge>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-1" 
          onClick={() => setEditingStatus(false)}
          disabled={isUpdating}
        >
          <X size={14} />
        </Button>
      </div>
    );
  }
  
  switch (status) {
    case 1: // 已批准
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-green-50 text-green-700 border-green-200">
            <Check size={12} className="mr-1" />
            已批准
          </Badge>
          {isTeacherOrAdmin && ( // 只有老师和管理员可以编辑状态
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingStatus(true)}>
              <Edit size={12} />
            </Button>
          )}
        </div>
      );
    case 2: // 已拒绝
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-red-50 text-red-700 border-red-200">
            <X size={12} className="mr-1" />
            已拒绝
          </Badge>
          {isTeacherOrAdmin && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingStatus(true)}>
              <Edit size={12} />
            </Button>
          )}
        </div>
      );
    default: // 0 = 待审核
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle size={12} className="mr-1" />
            待审核
          </Badge>
          {isTeacherOrAdmin && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditingStatus(true)}>
              <Edit size={12} />
            </Button>
          )}
        </div>
      );
  }
};