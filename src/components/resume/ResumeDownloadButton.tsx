import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ResumeDownloadButtonProps {
  resume: {
    fileUrl?: string;
    fileName?: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const ResumeDownloadButton: React.FC<ResumeDownloadButtonProps> = ({ 
  resume, 
  className, 
  children 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 边界情况检查
    if (!resume) {
      toast({
        title: "下载失败",
        description: "无效的简历数据",
        variant: "destructive",
      });
      return;
    }
    
    if (!resume.fileUrl) {
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
      // 从fileUrl中提取文件名
      // 使用更安全的方式提取文件名，避免数组越界错误
      const urlParts = resume.fileUrl.split('/');
      const fileName = urlParts.length > 0 ? urlParts[urlParts.length - 1] : 'resume-file';
      
      // 构建API请求URL，增加容错性
      const downloadUrl = fileName ? `/api/File/resumes/${fileName}` : resume.fileUrl;
      
      // 使用FileController的下载端点
      const response = await fetch(downloadUrl, {
        // 添加超时处理，避免挂起
        signal: AbortSignal.timeout(30000),
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
      a.download = resume.fileName || fileName || 'resume.file'; // 使用多级容错
      
      // 手动点击以支持Safari
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
      
      // 错误消息处理
      let errorMessage = '下载文件时发生错误，请稍后再试';
      if (error instanceof Error) {
        // 包含更详细的错误信息
        if (error.name === 'AbortError') {
          errorMessage = '下载超时，请检查您的网络连接并重试';
        } else if (error.message) {
          errorMessage = `下载失败: ${error.message}`;
        }
      }
      
      toast({
        title: "下载失败",
        description: errorMessage,
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
      className={className || "flex-1"}
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