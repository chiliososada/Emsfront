// src/components/recording/RecordingDownloadButton.tsx
import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface RecordingDownloadButtonProps {
  recording: {
    fileUrl?: string;
    fileName?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const RecordingDownloadButton: React.FC<RecordingDownloadButtonProps> = ({ 
  recording, 
  className, 
  children 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 边界情况检查
    if (!recording) {
      toast({
        title: "下载失败",
        description: "无效的录音数据",
        variant: "destructive",
      });
      return;
    }
    
    if (!recording.fileUrl) {
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
      // 假设fileUrl格式为 "/files/recordings/filename.mp3" 或 "/Storage/recordings/filename.mp3"
      const urlParts = recording.fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2] || 'recordings';
      
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

      // 创建下载链接并触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = recording.fileName || fileName || '录音文件.mp3';
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
          下载
        </span>
      )}
    </Button>
  );
};