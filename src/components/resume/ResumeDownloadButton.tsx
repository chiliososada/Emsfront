import React from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResumeDownloadButtonProps {
  resume: {
    fileUrl: string;
    fileName: string;
  };
  className?: string;
  children?: React.ReactNode;
}

export const ResumeDownloadButton: React.FC<ResumeDownloadButtonProps> = ({ 
  resume, 
  className, 
  children 
}) => {
  const handleDownload = async () => {
    try {
      // 从fileUrl中提取GUID文件名
      const fileName = resume.fileUrl.split('/').pop();
      
      // 使用FileController的下载端点
      const response = await fetch(`/api/File/resumes/${fileName}`);
      
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      // 获取文件数据并创建Blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // 创建下载链接并触发下载
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.fileName; // 使用原始文件名
      document.body.appendChild(a);
      a.click();
      
      // 清理
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载出错:', error);
      alert('下载文件时发生错误，请稍后再试');
    }
  };
  
  return (
    <Button 
      onClick={handleDownload}
      variant="outline"
      className={className || "flex-1"}
    >
      {children || (
        <span className="flex items-center justify-center gap-1">
          <FileDown size={16} />
          下载
        </span>
      )}
    </Button>
  );
};