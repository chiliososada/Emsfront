// src/components/attendance/AttendanceDownloadButton.tsx
import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface AttendanceDownloadButtonProps {
  fileUrl?: string;
  fileName?: string;
  fileType: 'attendance' | 'transportation';
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const AttendanceDownloadButton: React.FC<AttendanceDownloadButtonProps> = ({ 
  fileUrl, 
  fileName, 
  fileType,
  className, 
  children,
  disabled = false
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 边界情况检查
    if (!fileUrl) {
      toast({
        title: "下载失败",
        description: `${fileType === 'attendance' ? '勤务表' : '交通费凭证'}文件URL不存在`,
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
      const urlParts = fileUrl.split('/');
      const fileNameFromUrl = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2] || 'attendances';
      
      // 使用FileController的下载端点
      const response = await fetch(`/api/File/${folder}/${fileNameFromUrl}`, {
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

      // 创建下载链接并触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || fileNameFromUrl || `${fileType === 'attendance' ? '勤务表' : '交通费凭证'}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // 清理
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 100);
      
      toast({
        title: "下载成功",
        description: `${fileType === 'attendance' ? '勤务表' : '交通费凭证'}已成功下载`
      });
    } catch (error) {
      console.error('下载出错:', error);
      
      toast({
        title: "下载失败",
        description: `下载${fileType === 'attendance' ? '勤务表' : '交通费凭证'}时发生错误，请稍后再试`,
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
      size="sm"
      className={className || ""}
      disabled={isDownloading || disabled || !fileUrl}
    >
      {isDownloading ? (
        <span className="flex items-center justify-center gap-1">
          <span className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full"></span>
          下载中...
        </span>
      ) : children || (
        <span className="flex items-center justify-center gap-1">
          <Download size={14} />
          下载{fileType === 'attendance' ? '勤务表' : '交通费凭证'}
        </span>
      )}
    </Button>
  );
};