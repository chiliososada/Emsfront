import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';

interface QuestionMetadataProps {
  category: string;
  company?: string;
  isInternal: boolean;
  status: number; // 修改为数字类型
  questionId: number;
  onStatusChange?: () => void;
  position?: string; // 添加职位名称
}

export const QuestionMetadata: React.FC<QuestionMetadataProps> = ({
  category,
  company,
  isInternal,
  status,
  questionId,
  onStatusChange,
  position
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <Badge variant="outline">{category}</Badge>
      
      {/* 显示职位名称 */}
      {position && (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          {position}
        </Badge>
      )}
      
      {company && (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          {company}
        </Badge>
      )}
      
      {isInternal && (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          公司内部
        </Badge>
      )}
      
      <div className="ml-auto">
        <StatusBadge 
          status={status} 
          questionId={questionId}
          onStatusChange={onStatusChange}
        />
      </div>
    </div>
  );
};