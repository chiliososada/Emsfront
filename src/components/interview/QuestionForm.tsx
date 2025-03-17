import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckIcon, Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { caseService } from '@/services/caseService';
import { questionService } from '@/services/questionService';
import { useAuth } from '@/contexts/AuthContext';

export const QuestionForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [caseContent, setCaseContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [source, setSource] = useState<number>(0); // 0 = Personal, 1 = Company

  // 案例相关字段
  const [caseName, setCaseName] = useState('');
  const [position, setPosition] = useState('');
  
  // 获取可能的职位列表
  const [availablePositions, setAvailablePositions] = useState<string[]>([]);
  const [loadingPositions, setLoadingPositions] = useState(false);

  // 获取用户类型
  const { user } = useAuth();
  const userType = user?.userType || 0; // 默认为 student(0)
  const isTeacherOrAdmin = userType === 1 || userType === 2; // 教师或管理员

  // 获取可用的职位列表
  const fetchPositions = async () => {
    try {
      setLoadingPositions(true);
      const response = await caseService.getCases(1, 100);
      
      if (response && response.items) {
        // 提取不同的职位并过滤掉null和空值
        const uniquePositions = Array.from(
          new Set(
            response.items
              .map(item => item.position)
              .filter(position => position && position.trim() !== '')
          )
        );
        
        setAvailablePositions(uniquePositions);
      }
    } catch (error) {
      console.error('获取职位列表失败:', error);
    } finally {
      setLoadingPositions(false);
    }
  };

  // 当组件挂载时，获取职位列表和设置默认值
  useEffect(() => {
    if (isExpanded) {
     // fetchPositions();
    }
    
    if (isTeacherOrAdmin) {
      setCaseName('toyousoft');
    }
  }, [isExpanded, isTeacherOrAdmin]);

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setCaseContent('');
    setPosition('');
    setSource(0);
    
    // 只有在学生模式下才重置案例名称
    if (!isTeacherOrAdmin) {
      setCaseName('');
    } else {
      setCaseName('toyousoft');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast({
        title: "问题不能为空",
        description: "请输入面试问题内容。",
        variant: "destructive",
      });
      return;
    }

    if (!position.trim()) {
      toast({
        title: "职位名称不能为空",
        description: "职位名称是必填项。",
        variant: "destructive",
      });
      return;
    }

    if (!isTeacherOrAdmin && !caseName.trim()) {
      toast({
        title: "案例名称不能为空",
        description: "请输入案例名称。",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 创建案例
      const caseRequest = {
        caseName: caseName || `面试问题集`,
        companyName: isTeacherOrAdmin ? 'toyousoft' : undefined,
        position: position,
        description: caseContent || `${position}相关面试问题`
      };
      
      const caseResponse = await caseService.createCase(caseRequest);
      const caseId = caseResponse.caseId;
      
      // 创建问题
      const questionRequest = {
        caseID: caseId,
        questionText: question,
        answer: answer || "",
        source: source 
      };
      
      await questionService.createQuestion(questionRequest);
      
      toast({
        title: "问题已提交",
        description: "您的面试问题已成功提交。",
      });
      
      // 重置表单
      resetForm();
      setIsExpanded(false);
      
      // 调用成功回调函数（如刷新问题列表）
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('提交问题时出错:', error);
      toast({
        title: "提交失败",
        description: "提交问题时发生错误，请重试。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-2 animate-in"
        variant="outline"
      >
        <Plus size={16} />
        添加新面试问题
      </Button>
    );
  }

  return (
    <Card className="glass-card animate-in overflow-hidden border border-gray-200">
      <CardContent className="p-0">
        <div className="flex justify-between items-center px-5 py-4 border-b">
          <h3 className="font-medium">添加新面试问题</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setIsExpanded(false)}
          >
            <X size={16} />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="caseName">案例名称 {!isTeacherOrAdmin && "*"}</Label>
              <Input
                id="caseName"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="输入案例名称"
                disabled={isTeacherOrAdmin} // 教师或管理员不可编辑
                required={!isTeacherOrAdmin} // 学生必填
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="position">关键字（Java,JavaScript） *</Label>
              {availablePositions.length > 0 ? (
                <Select 
                  value={position} 
                  onValueChange={setPosition}
                >
                  <SelectTrigger id="position">
                    <SelectValue placeholder="选择职位名称" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePositions.map((pos) => (
                      <SelectItem key={pos} value={pos}>
                        {pos}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">+ 添加新职位</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="输入职位名称"
                  required
                />
              )}
              
              {/* 如果选择"添加新职位"，则显示输入框 */}
              {position === 'other' && (
                <Input
                  className="mt-2"
                  value=""
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="输入新职位名称"
                  required
                />
              )}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="caseContent">案例内容</Label>
            <Textarea
              id="caseContent"
              value={caseContent}
              onChange={(e) => setCaseContent(e.target.value)}
              placeholder="输入案例内容（可选）"
            />
          </div>
        
          <div className="space-y-1.5">
            <Label htmlFor="question">问题 *</Label>
            <Input
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="输入面试问题"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="answer">答案 *</Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="输入问题答案"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="source">问题来源</Label>
            <Select 
              value={source.toString()} 
              onValueChange={(value) => setSource(parseInt(value))}
            >
              <SelectTrigger id="source">
                <SelectValue placeholder="选择问题来源" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">个人</SelectItem>
                <SelectItem value="1">公司</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-2 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                  提交中...
                </>
              ) : (
                <>
                  <CheckIcon size={16} />
                  提交问题
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};