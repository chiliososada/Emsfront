import React, { useState, useEffect, useCallback } from 'react';
import { RecordingCard } from '@/components/recording/RecordingCard';
import { RecordingUpload } from '@/components/recording/RecordingUpload';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Plus, X, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { recordingService, Recording } from '@/services/recordingService';
import { useToast } from '@/hooks/use-toast';
const RecordingsPage = () => {
  // 状态定义
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mounted, setMounted] = useState(false);

  // 在组件挂载后设置mounted状态
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // 获取录音列表
  const fetchRecordings = useCallback(async () => {
    // 如果组件已卸载，不执行任何操作
    if (!mounted) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await recordingService.getRecordings();
      
      // 如果组件已卸载，不更新状态
      if (!mounted) return;
      
      // 安全地处理数据
      const safeData = Array.isArray(data) ? data : [];
      
      setRecordings(safeData);
    } catch (error) {
      console.error('获取录音列表失败:', error);
      
      // 如果组件已卸载，不更新状态
      if (!mounted) return;
      
      setError('无法加载录音列表，请重试');
      toast({
        title: "获取失败",
        description: "无法获取录音列表，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      // 如果组件已卸载，不更新状态
      if (!mounted) return;
      setLoading(false);
    }
  }, [toast, mounted]);

  // 组件挂载和refreshTrigger变化时重新获取数据
  useEffect(() => {
    if (mounted) {
      fetchRecordings();
    }
  }, [fetchRecordings, refreshTrigger, mounted]);

  // 过滤录音列表
  const filteredRecordings = React.useMemo(() => {
    return recordings.filter(recording => {
      return searchQuery
        ? (recording.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
           recording.fileName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recording.caseContent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recording.caseInformation?.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
    });
  }, [recordings, searchQuery]);

  // 手动刷新数据
  const handleRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // 如果组件未挂载，返回null避免任何渲染
  if (!mounted) return null;

  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        {/* 页面标题 */}
        <div className="flex justify-between items-start flex-wrap gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">录音</h1>
            <p className="text-muted-foreground mt-1">
              上传和管理案件录音文件
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              刷新
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowUpload(!showUpload)}
            >
              {showUpload ? <X size={16} /> : <Plus size={16} />}
              {showUpload ? '取消' : '上传录音'}
            </Button>
          </div>
        </div>

        {/* 上传表单 */}
        {showUpload && (
          <div className="animate-fade-in">
            <RecordingUpload onUploadSuccess={() => {
              setRefreshTrigger(prev => prev + 1);
              setShowUpload(false);
            }} />
          </div>
        )}

        {/* 搜索 */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="搜索录音..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 录音列表 */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 border border-border rounded-lg p-4">
            {error ? (
              <div className="col-span-full flex flex-col items-center justify-center py-8">
                <div className="rounded-full bg-destructive/10 p-3 mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-medium">加载失败</h3>
                <p className="text-muted-foreground mt-1 mb-4">{error}</p>
                <Button onClick={handleRefresh}>重试</Button>
              </div>
            ) : loading ? (
              <div className="col-span-full flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <>
                {filteredRecordings.length > 0 ? (
                  filteredRecordings.map((recording) => (
                    <RecordingCard
                    key={recording.recordingID}
                    recording={recording}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">没有找到录音</h3>
                    <p className="text-muted-foreground mt-1 max-w-md">
                      {searchQuery 
                        ? "未找到匹配的录音文件。尝试调整搜索条件或上传新的录音。"
                        : "您还没有上传任何录音文件。点击按钮开始上传。"}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordingsPage;