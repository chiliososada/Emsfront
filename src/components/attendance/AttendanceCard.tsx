import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Attendance, getStatusText } from '@/services/attendanceService';
import { format } from 'date-fns';

interface AttendanceCardProps {
  attendance: Attendance;
  onDownload: (type: 'attendance' | 'transportation', attendance: Attendance) => void;
  onDelete: (attendance: Attendance) => void;
  onReview?: (attendance: Attendance, newStatus: number) => void;
  isTeacherOrAdmin?: boolean;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  attendance,
  onDownload,
  onDelete,
  onReview,
  isTeacherOrAdmin = false
}) => {
  // 格式化日期
  const formatDate = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'yyyy年MM月dd日');
  };
  
  // 获取状态的徽章组件
  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: // Pending
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-800 hover:bg-yellow-100">
            <AlertCircle size={12} />
            待审核
          </Badge>
        );
      case 1: // Approved
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-800 hover:bg-green-100">
            <CheckCircle size={12} />
            已批准
          </Badge>
        );
      case 2: // Rejected
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-800 hover:bg-red-100">
            <XCircle size={12} />
            已拒绝
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            未知状态
          </Badge>
        );
    }
  };
  
  return (
    <Card className="hover-scale glass-card overflow-hidden animate-in">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-lg leading-tight">
                {attendance.month}月勤务表
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Calendar size={14} />
                <span>上传于 {formatDate(attendance.uploadDate)}</span>
              </div>
            </div>
            {getStatusBadge(attendance.status)}
          </div>

          <div className="grid grid-cols-2 gap-y-2 text-sm mt-4">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-muted-foreground" />
              <span>勤务时间: <strong>{attendance.workHours || 0} 小时</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-muted-foreground" />
              <span>交通费: <strong>{attendance.transportationFee || 0} 円</strong></span>
            </div>
          </div>
          
          {attendance.comments && (
            <div className="mt-3 text-sm">
              <p className="text-xs font-medium text-muted-foreground">备注</p>
              <p className="line-clamp-2">{attendance.comments}</p>
            </div>
          )}
        </div>
        
        <div className="flex border-t">
          <Button 
            variant="ghost" 
            className="flex-1 py-2 rounded-none text-primary hover:bg-primary/5 hover:text-primary"
            onClick={() => onDownload('attendance', attendance)}
          >
            <Download size={16} className="mr-1" />
            勤务表
          </Button>
          
          {attendance.transportationFileUrl && (
            <Button 
              variant="ghost" 
              className="flex-1 py-2 rounded-none text-primary hover:bg-primary/5 hover:text-primary border-l"
              onClick={() => onDownload('transportation', attendance)}
            >
              <Download size={16} className="mr-1" />
              交通费凭证
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="py-2 rounded-none px-3 text-muted-foreground hover:bg-muted/20 border-l"
              >
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem 
                className="text-destructive flex items-center focus:text-destructive"
                onClick={() => onDelete(attendance)}
              >
                <Trash2 size={16} className="mr-2" />
                删除
              </DropdownMenuItem>
              
              {isTeacherOrAdmin && attendance.status === 0 && onReview && (
                <>
                  <DropdownMenuItem 
                    className="text-green-600 flex items-center focus:text-green-600"
                    onClick={() => onReview(attendance, 1)}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    批准
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    className="text-red-600 flex items-center focus:text-red-600"
                    onClick={() => onReview(attendance, 2)}
                  >
                    <XCircle size={16} className="mr-2" />
                    拒绝
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};