import React, { useState } from 'react';
import { Upload, XCircle, FileText, Image, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { resumeService } from '@/services/resumeService';

interface ResumeUploadProps {
  onUploadSuccess?: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // 支持的文件类型
  const allowedFileTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  const validateFile = (file: File) => {
    if (!allowedFileTypes.includes(file.type)) {
      const extensions = '.jpg, .jpeg, .png, .gif, .pdf, .doc, .docx, .xls, .xlsx';
      toast({
        title: "文件类型不支持",
        description: `请上传以下格式的文件: ${extensions}`,
        variant: "destructive",
      });
      return false;
    }
    
    // 检查文件大小，限制为5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "文件大小不能超过5MB。",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!validateFile(selectedFile)) {
        return;
      }
      setFile(selectedFile);
      if (!title) {
        // 移除文件扩展名作为标题
        const fileName = selectedFile.name.split('.');
        fileName.pop(); // 移除扩展名
        setTitle(fileName.join('.'));
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!validateFile(droppedFile)) {
        return;
      }
      setFile(droppedFile);
      if (!title) {
        const fileName = droppedFile.name.split('.');
        fileName.pop();
        setTitle(fileName.join('.'));
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      toast({
        title: "缺少信息",
        description: "请提供标题并上传简历文件。",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const response = await resumeService.uploadResume(file, title);
      
      toast({
        title: "简历上传成功",
        description: response.message || "您的简历已成功上传。",
      });
      
      setFile(null);
      setTitle('');
      
      // 调用成功回调，刷新列表
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('简历上传失败:', error);
      toast({
        title: "上传失败",
        description: "简历上传过程中发生错误，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image size={20} className="text-purple-500" />;
    } else if (fileType === 'application/pdf') {
      return <FileText size={20} className="text-red-500" />;
    } else if (fileType.includes('word')) {
      return <FileText size={20} className="text-blue-500" />;
    } else if (fileType.includes('excel')) {
      return <FileSpreadsheet size={20} className="text-green-500" />;
    }
    return <FileText size={20} className="text-gray-500" />;
  };

  return (
    <Card className="glass-card animate-in overflow-hidden">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-lg font-medium mb-4">上传简历</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1.5">
                  简历标题
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="为你的简历取一个名字"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  简历文件
                </label>
                
                {!file ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">
                      拖放你的简历，或{" "}
                      <span className="text-primary font-medium">浏览文件</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      支持JPG、JPEG、PNG、GIF、PDF、DOC、DOCX、XLS、XLSX格式，最大5MB
                    </p>
                    <Input
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="sr-only">
                      选择文件
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-blue-50 rounded">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 rounded-full hover:bg-muted transition-colors"
                    >
                      <XCircle size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t bg-muted/30">
            <Button type="submit" className="w-full" disabled={isUploading}>
              {isUploading ? "上传中..." : "上传简历"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};