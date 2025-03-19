import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AttendanceDownloadButtonProps {
  attendance: {
    fileUrl?: string;
    fileName?: string;
    month?: string; // 可能用于文件名
  };
  className?: string;
  children?: React.ReactNode;
  fileType?: 'attendance' | 'transportation'; // 文件类型，用于区分文件名
}

export const AttendanceDownloadButton: React.FC<AttendanceDownloadButtonProps> = ({ 
  attendance, 
  className, 
  children,
  fileType = 'attendance' // 默认为勤务表
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuth(); // 获取当前用户信息

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 边界情况检查
    if (!attendance) {
      toast({
        title: "下载失败",
        description: "无效的勤务表数据",
        variant: "destructive",
      });
      return;
    }
    
    if (!attendance.fileUrl) {
      toast({
        title: "下载失败",
        description: "文件URL不存在",
        variant: "destructive",
      });
      return;
    }
    
    if (isDownloading) {
      return; // 防止重复下载
    }
    
    setIsDownloading(true);
    
    try {
      // 从fileUrl中提取文件夹和文件名
      // 假设fileUrl格式为 "/files/attendances/filename.xlsx" 或 "/Storage/attendances/filename.xlsx"
      const urlParts = attendance.fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2] || 'attendances';
      
      // 使用FileController的下载端点
      const response = await fetch(`/api/File/${folder}/${fileName}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }

      // 获取文件数据并创建Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // 创建新的文件名，加入用户名
      let newFileName = '';
      const originalName = attendance.fileName || fileName || '';
      const extension = originalName.split('.').pop() || 'xlsx'; // 获取扩展名
      const userName = user?.username || '用户'; // 如果无法获取用户名，使用默认值
      const month = attendance.month || ''; // 获取月份，如果存在
      
      // 构建新文件名：用户名_文件类型_月份.扩展名
      if (month) {
        newFileName = `${userName}_${fileType === 'attendance' ? '勤務表' : '交通費'}_${month}.${extension}`;
      } else {
        // 没有月份信息时使用原始文件名但添加用户名前缀
        const nameWithoutExtension = originalName.replace(`.${extension}`, '');
        newFileName = `${userName}_${nameWithoutExtension}.${extension}`;
      }

      // 创建下载链接并触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = newFileName;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast({
        title: "下载成功",
        description: "文件已成功下载"
      });
    } catch (error) {
      console.error('下载出错:', error);
      
      toast({
        title: "下载失败",
        description: "下载文件时发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <Button 
      onClick={handleDownload}
      variant="ghost"
      className={className || ""}
      disabled={isDownloading}
    >
      {isDownloading ? (
        <span className="flex items-center justify-center gap-1">
          <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
          下载中...
        </span>
      ) : children || (
        <span className="flex items-center justify-center gap-1">
          <FileDown size={16} />
          {fileType === 'attendance' ? '下载勤务表' : '下载交通费'}
        </span>
      )}
    </Button>
  );
};