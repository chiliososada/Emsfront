// src/components/attendance/AttendanceCard.tsx
import React from 'react';
import { Attendance, getStatusText } from '@/services/attendanceService';
import { 
  Card, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  MoreHorizontal, 
  Trash2, 
  Check, 
  X, 
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AttendanceDownloadButton } from './AttendanceDownloadButton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AttendanceCardProps {
  attendance: Attendance;
  isTeacherOrAdmin: boolean;
  onDelete: (attendance: Attendance) => void;
  onReview: (attendance: Attendance, status: number) => void;
}

// 安全地格式化数字，处理undefined、null和NaN情况
const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  if (isNaN(value)) return '0';
  return value.toString();
};

// 安全地格式化日期
const formatDate = (date: Date | string): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(dateObj);
  } catch (error) {
    return '日期无效';
  }
};

// 获取状态徽章
const getStatusBadge = (status: number) => {
  switch (status) {
    case 0:
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">待审核</Badge>;
    case 1:
      return <Badge className="bg-green-50 text-green-700 border-green-200">已批准</Badge>;
    case 2:
      return <Badge className="bg-red-50 text-red-700 border-red-200">已拒绝</Badge>;
    default:
      return <Badge variant="outline">未知状态</Badge>;
  }
};

export const AttendanceCard: React.FC<AttendanceCardProps> = ({ 
  attendance, 
  isTeacherOrAdmin, 
  onDelete, 
  onReview 
}) => {
  // 确保workHours和transportationFee有效
  const workHours = typeof attendance.workHours === 'number' ? attendance.workHours : 0;
  const transportationFee = typeof attendance.transportationFee === 'number' ? attendance.transportationFee : 0;

  return (
    <Card className="hover-scale glass-card overflow-hidden animate-in border">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{attendance.month} 勤务表</h3>
          <div className="flex gap-2 items-center">
            {getStatusBadge(attendance.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {attendance.status !== 1 && isTeacherOrAdmin && (
                  <DropdownMenuItem 
                    className="text-green-600 font-medium"
                    onClick={() => onReview(attendance, 1)}
                  >
                    <Check size={16} className="mr-2" />
                    批准
                  </DropdownMenuItem>
                )}
                {attendance.status !== 2 && isTeacherOrAdmin && (
                  <DropdownMenuItem 
                    className="text-red-600 font-medium"
                    onClick={() => onReview(attendance, 2)}
                  >
                    <X size={16} className="mr-2" />
                    拒绝
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-red-600 font-medium"
                  onClick={() => onDelete(attendance)}
                >
                  <Trash2 size={16} className="mr-2" />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={16} />
            <span>{attendance.username || `用户 ${attendance.userID}`}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span>{formatDate(attendance.uploadDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>工时: <span className="font-medium text-foreground">{workHours}小时</span></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign size={16} />
            <span>交通费: <span className="font-medium text-foreground">{transportationFee}¥</span></span>
          </div>
        </div>
        
        {/* 审核信息（如果有） */}
        {attendance.reviewerName && (
          <div className="mt-3 text-sm border-t pt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText size={14} />
              <span>审核人: {attendance.reviewerName}</span>
            </div>
            {attendance.comments && (
              <div className="mt-1 ml-6 text-sm">
                <p className="italic text-muted-foreground">{attendance.comments}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex border-t p-0">
  <AttendanceDownloadButton
    attendance={{
      fileUrl: attendance.fileUrl,
      fileName: `勤务表_${attendance.month}.xlsx`,
      month: attendance.month
    }}
    fileType="attendance"
    className="flex-1 py-2.5 justify-center"
  />
  
  {attendance.transportationFileUrl && (
    <div className="w-px bg-border h-10"></div>
  )}
  
  {attendance.transportationFileUrl && (
    <AttendanceDownloadButton
      attendance={{
        fileUrl: attendance.transportationFileUrl,
        fileName: `交通费_${attendance.month}.xlsx`,
        month: attendance.month
      }}
      fileType="transportation"
      className="flex-1 py-2.5 justify-center"
    />
  )}
</CardFooter>
    </Card>
  );
};