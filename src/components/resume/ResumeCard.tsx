import React, { useState } from 'react';
import { Resume } from '@/services/resumeService';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { ResumeDownloadButton } from './ResumeDownloadButton';

interface ResumeCardProps {
  resume: Resume;
  onView?: () => void;
}

// 修改后的安全格式化日期函数
const formatDate = (date: Date | string | undefined) => {
  if (!date) return '无日期';
  
  try {
    // 如果输入是字符串，则转换为Date对象
    const dateObj = typeof date === 'string' 
      ? new Date(date.endsWith('Z') ? date : date + 'Z') 
      : date;
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      return '日期无效';
    }
    
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '日期错误';
  }
};

// 获取状态图标 - 更安全的实现
const getStatusIcon = (status: Resume['status'] | undefined) => {
  if (!status) return <Clock size={16} className="text-yellow-500" />;
  
  switch (status) {
    case 'approved':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'reviewed':
      return <Clock size={16} className="text-blue-500" />;
    default:
      return <Clock size={16} className="text-yellow-500" />;
  }
};

// 获取状态颜色 - 更安全的实现
const getStatusColor = (status: Resume['status'] | undefined) => {
  if (!status) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'reviewed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
};

// 获取状态文本 - 更安全的实现
const getStatusText = (status: Resume['status'] | undefined) => {
  if (!status) return '待审核';
  
  switch (status) {
    case 'approved':
      return '已批准';
    case 'reviewed':
      return '已审阅';
    default:
      return '待审核';
  }
};

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onView }) => {
  // 错误状态处理
  const [hasError, setHasError] = useState(false);
  
  // 如果resume参数为空或无效，显示错误状态的卡片
  if (!resume || hasError) {
    return (
      <Card className="hover-scale glass-card overflow-hidden animate-in border border-gray-200">
        <CardContent className="p-0">
          <div className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-lg leading-tight text-balance">数据错误</h3>
                <p className="text-sm text-muted-foreground mt-1">无法显示此简历</p>
              </div>
              <Badge className="ml-2 bg-red-50 text-red-700 border-red-200">错误</Badge>
            </div>
            <div className="flex flex-wrap gap-y-2 items-center text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <FileText size={14} />
                简历数据加载失败
              </span>
            </div>
          </div>
          <div className="flex divide-x border-t mt-1">
            <button 
              className="flex-1 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
              onClick={() => setHasError(false)} // 尝试重置错误状态
            >
              重试
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 安全地访问resume数据
  const title = resume.title || '无标题';
  const fileName = resume.fileName || '未知文件名';
  const status = resume.status || 'pending';
  const uploadedAt = resume.uploadedAt || new Date();
  const comments = Array.isArray(resume.comments) ? resume.comments : [];

  // 安全地处理点击事件
  const handleViewClick = () => {
    try {
      if (onView) {
        onView();
      }
    } catch (error) {
      console.error('查看操作失败:', error);
      toast({
        title: "操作失败",
        description: "无法执行此操作，请稍后重试。",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="hover-scale glass-card overflow-hidden animate-in border border-gray-200">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-lg leading-tight text-balance">{title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
            </div>
            <Badge className={`ml-2 ${getStatusColor(status)}`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(status)}
                {getStatusText(status)}
              </span>
            </Badge>
          </div>
          <div className="flex flex-wrap gap-y-2 items-center text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText size={14} />
              上传时间 {formatDate(uploadedAt)}
            </span>
            {comments.length > 0 && (
              <Badge variant="outline" className="ml-auto">
                有评价
              </Badge>
            )}
          </div>
        </div>
        <div className="flex divide-x border-t mt-1">
          <button 
            className="flex-1 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
            onClick={handleViewClick}
          >
            查看
          </button>
          <ResumeDownloadButton 
            resume={resume} 
            className="flex-1 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors border-0"
          >
            下载
          </ResumeDownloadButton>
        </div>
      </CardContent>
    </Card>
  );
};