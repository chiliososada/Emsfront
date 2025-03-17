import React from 'react';
import { Resume } from '@/services/resumeService';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { resumeService } from '@/services/resumeService';
import { toast } from '@/components/ui/use-toast';
import { ResumeDownloadButton } from './ResumeDownloadButton';

interface ResumeCardProps {
  resume: Resume;
  onView?: () => void;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

const getStatusIcon = (status: Resume['status']) => {
  switch (status) {
    case 'approved':
      return <CheckCircle size={16} className="text-green-500" />;
    case 'reviewed':
      return <Clock size={16} className="text-blue-500" />;
    default:
      return <Clock size={16} className="text-yellow-500" />;
  }
};

const getStatusColor = (status: Resume['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'reviewed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  }
};

export const ResumeCard: React.FC<ResumeCardProps> = ({ resume, onView }) => {
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await resumeService.downloadResume(resume.fileUrl, resume.fileName);
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        title: "下载失败",
        description: "无法下载文件，请稍后重试。",
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
              <h3 className="font-medium text-lg leading-tight text-balance">{resume.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{resume.fileName}</p>
            </div>
            <Badge className={`ml-2 ${getStatusColor(resume.status)}`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(resume.status)}
                {{
                  'pending': '待审核',
                  'reviewed': '已审阅',
                  'approved': '已批准'
                }[resume.status]}
              </span>
            </Badge>
          </div>
          <div className="flex flex-wrap gap-y-2 items-center text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText size={14} />
              上传时间 {formatDate(resume.uploadedAt)}
            </span>
            {resume.comments && resume.comments.length > 0 && (
              <Badge variant="outline" className="ml-auto">
                {/* {resume.comments.length} 评价 */}
                有评价
              </Badge>
            )}
          </div>
        </div>
        <div className="flex divide-x border-t mt-1">
          <button 
            className="flex-1 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
            onClick={onView}
          >
            查看
          </button>
          {/* <button 
            className="flex-1 py-2.5 text-center text-sm font-medium text-primary hover:bg-muted/50 transition-colors"
            onClick={handleDownload}
          >
            下载
          </button> */}

<ResumeDownloadButton resume={resume} />
        </div>
      </CardContent>
    </Card>
  );
};