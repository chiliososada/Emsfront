import React from 'react';
import { Recording } from '@/services/recordingService';
import { Music, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { RecordingDownloadButton } from './RecordingDownloadButton';

interface RecordingCardProps {
  recording: Recording;
}

// 安全格式化日期函数
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

export const RecordingCard: React.FC<RecordingCardProps> = ({ recording }) => {
  // 处理无效录音数据的情况
  if (!recording) {
    return (
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="p-5">
            <h3 className="font-medium text-lg leading-tight">数据错误</h3>
            <p className="text-sm text-muted-foreground mt-1">无法显示此录音</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-scale glass-card overflow-hidden animate-in border border-gray-200">
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-lg leading-tight text-balance">{recording.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{recording.fileName}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-full">
              <Music size={18} className="text-purple-500" />
            </div>
          </div>
          <div className="flex flex-wrap gap-y-2 items-center text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Clock size={14} />
              上传时间 {formatDate(recording.uploadedAt)}
            </span>
          </div>
          
          <div className="mt-3 space-y-2">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground">案件内容</h4>
              <p className="text-sm line-clamp-2">{recording.caseContent}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground">案件信息</h4>
              <p className="text-sm line-clamp-2">{recording.caseInformation}</p>
            </div>
          </div>
        </div>
        <div className="border-t mt-1">
          <RecordingDownloadButton 
            recording={recording} 
            className="w-full py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors border-0"
          >
            下载录音
          </RecordingDownloadButton>
        </div>
      </CardContent>
    </Card>
  );
};