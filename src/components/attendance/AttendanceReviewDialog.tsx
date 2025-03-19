// src/components/attendance/AttendanceReviewDialog.tsx
import React, { useState } from 'react';
import { Attendance, getStatusText } from '@/services/attendanceService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface AttendanceReviewDialogProps {
  attendance: Attendance | null;
  statusToSet: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (attendance: Attendance, status: number, comments: string) => void;
  isLoading: boolean;
}

export const AttendanceReviewDialog: React.FC<AttendanceReviewDialogProps> = ({
  attendance,
  statusToSet,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}) => {
  const [comments, setComments] = useState('');

  // 如果没有选中的勤务表或状态，不渲染对话框
  if (!attendance || statusToSet === null) return null;

  // 格式化工时和交通费
  const workHours = typeof attendance.workHours === 'number' ? attendance.workHours : 0;
  const transportationFee = typeof attendance.transportationFee === 'number' ? attendance.transportationFee : 0;

  // 审核操作类型文本
  const actionText = statusToSet === 1 ? '批准' : '拒绝';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{actionText}勤务表</DialogTitle>
          <DialogDescription>
            您正在{actionText} {attendance.month} 的勤务表
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-muted-foreground" />
              <span>勤务月份: <span className="font-medium">{attendance.month}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-muted-foreground" />
              <span>工作时间: <span className="font-medium">{workHours} 小时</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign size={16} className="text-muted-foreground" />
              <span>交通费: <span className="font-medium">{transportationFee} ¥</span></span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              审核意见 (可选)
            </label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={`请输入${actionText}意见（可选）`}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setComments('');
            }}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant={statusToSet === 1 ? "default" : "destructive"}
            onClick={() => onConfirm(attendance, statusToSet, comments)}
            disabled={isLoading}
          >
            {isLoading ? "处理中..." : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};