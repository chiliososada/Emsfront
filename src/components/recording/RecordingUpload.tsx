import React, { useState, useRef } from 'react';
import { Upload, XCircle, Mic, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { recordingService } from '@/services/recordingService';

interface RecordingUploadProps {
  onUploadSuccess?: () => void;
}

export const RecordingUpload: React.FC<RecordingUploadProps> = ({ onUploadSuccess }) => {
  // 在组件开头添加上传进度状态
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [caseContent, setCaseContent] = useState('');
  const [caseInformation, setCaseInformation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 支持的文件类型
  const allowedFileTypes = [
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
    'audio/x-m4a', 'audio/aac', 'audio/webm'
  ];

  const validateFile = (file: File) => {
    if (!allowedFileTypes.includes(file.type)) {
      const extensions = '.mp3, .wav, .ogg, .m4a, .aac, .webm';
      toast({
        title: "文件类型不支持",
        description: `请上传以下格式的音频文件: ${extensions}`,
        variant: "destructive",
      });
      return false;
    }
    
    // 检查文件大小，限制为200MB
    if (file.size > 200 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "文件大小不能超过200MB。",
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

  // 打开文件选择对话框
  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
    // 重置file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

 // 修改 handleSubmit 方法中的 toast 相关代码:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!file || !title.trim() || !caseContent.trim() || !caseInformation.trim()) {
    toast({
      title: "缺少信息",
      description: "请提供标题、案件名、案件信息并上传录音文件。",
      variant: "destructive",
    });
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);
  
  try {
    // 使用支持进度报告的上传方法
    const response = await recordingService.uploadRecordingWithProgress(
      file, 
      title, 
      caseContent, 
      caseInformation,
      (progress) => {
        setUploadProgress(progress);
        // 不更新 toast，只更新组件内部状态
      }
    );
    
    // 上传成功显示 toast
    toast({
      title: "录音上传成功",
      description: response.message || "您的录音已成功上传。",
    });
    
    setFile(null);
    setTitle('');
    setCaseContent('');
    setCaseInformation('');
    setUploadProgress(0);
    
    // 调用成功回调，刷新列表
    if (onUploadSuccess) {
      onUploadSuccess();
    }
  } catch (error) {
    console.error('录音上传失败:', error);
    toast({
      title: "上传失败",
      description: "录音上传过程中发生错误，请重试。",
      variant: "destructive",
    });
  } finally {
    setIsUploading(false);
  }
};

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    return <Music size={20} className="text-purple-500" />;
  };

  return (
    <Card className="glass-card animate-in overflow-hidden">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-lg font-medium mb-4">上传录音<span className="text-red-500">（すべての項目を日本語で入力してください。）</span></h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1.5">
                  录音标题 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="为你的录音取一个名字"
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="caseContent" className="block text-sm font-medium mb-1.5">
                  案件名 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="caseContent"
                  value={caseContent}
                  onChange={(e) => setCaseContent(e.target.value)}
                  placeholder="请输入案件内容"
                  className="w-full min-h-[80px]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="caseInformation" className="block text-sm font-medium mb-1.5">
                  案件信息 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="caseInformation"
                  value={caseInformation}
                  onChange={(e) => setCaseInformation(e.target.value)}
                  placeholder="请输入案件相关信息"
                  className="w-full min-h-[80px]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  录音文件 <span className="text-red-500">*</span>
                </label>
                
                {!file ? (
                  <div
                    onClick={openFileSelector}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Mic className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-1">
                      拖放你的录音文件，或点击此处上传
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation(); // 防止事件冒泡
                        openFileSelector();
                      }}
                      className="mt-2"
                    >
                      浏览文件
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      支持MP3, WAV, OGG, M4A, AAC, WEBM格式，最大200MB
                    </p>
                    <Input
                      type="file"
                      accept=".mp3,.wav,.ogg,.m4a,.aac,.webm,audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="recording-upload"
                      ref={fileInputRef}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 bg-purple-50 rounded">
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
  {isUploading && (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
      <div 
        className="bg-primary h-2.5 rounded-full transition-all duration-300" 
        style={{ width: `${uploadProgress}%` }}
      ></div>
    </div>
  )}
  <Button type="submit" className="w-full" disabled={isUploading}>
    {isUploading ? `上传中... ${uploadProgress}%` : "上传录音"}
  </Button>
</div>
        </form>
      </CardContent>
    </Card>
  );
};