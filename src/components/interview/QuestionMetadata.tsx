import React from 'react';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from './StatusBadge';

interface QuestionMetadataProps {
  category: string;
  company?: string;
  isInternal: boolean;
  status: number; 
  questionId: number;
  onStatusChange?: () => void;
  position?: string; 
}

export const QuestionMetadata: React.FC<QuestionMetadataProps> = ({
  status,
  questionId,
  onStatusChange,
  position
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {/* 只保留position标签，删除其他标签 */}
      {position && (
       <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
          {position}
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