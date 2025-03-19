import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import { Attendance, getStatusText } from '@/services/attendanceService';

interface AttendanceReviewDialogProps {
  attendance: Attendance | null;
  open: boolean;
  statusToSet: number | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (attendance: Attendance, status: number, comments: string) => void;
  isLoading: boolean;
}

export const AttendanceReviewDialog: React.FC<AttendanceReviewDialogProps> = ({
  attendance,
  open,
  statusToSet,
  onOpenChange,
  onConfirm,
  isLoading
}) => {
  const [comments, setComments] = useState('');
  
  if (!attendance || statusToSet === null) {
    return null;
  }
  
  const isApproval = statusToSet === 1;
  
  const handleSubmit = () => {
    if (attendance && statusToSet !== null) {
      onConfirm(attendance, statusToSet, comments);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApproval ? (
              <>
                <CheckCircle className="text-green-500" size={18} />
                批准勤务表
              </>
            ) : (
              <>
                <XCircle className="text-red-500" size={18} />
                拒绝勤务表
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-1 mb-4">
            <p className="text-sm font-medium">勤务月份</p>
            <p className="text-sm">{attendance.month}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">勤务时间</p>
              <p className="text-sm">{attendance.workHours || 0} 小时</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">交通费</p>
              <p className="text-sm">{attendance.transportationFee || 0} 円</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comments">审核意见</Label>
            <Textarea
              id="comments"
              placeholder={isApproval ? "添加批准意见（可选）" : "请说明拒绝原因"}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button
            variant={isApproval ? "default" : "destructive"}
            onClick={handleSubmit}
            disabled={isLoading || (!isApproval && !comments.trim())}
          >
            {isLoading ? "处理中..." : isApproval ? "批准" : "拒绝"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};