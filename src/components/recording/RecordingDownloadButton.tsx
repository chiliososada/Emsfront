import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { recordingService } from '@/services/recordingService';

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
      // 调用下载服务
      await recordingService.downloadRecording(
        recording.fileUrl,
        recording.fileName || '录音文件.mp3'
      );
      
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