import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, File, FileText, XCircle } from 'lucide-react';
import { attendanceService, AttendanceUploadRequest } from '@/services/attendanceService';

interface AttendanceUploadProps {
  onUploadSuccess?: () => void;
}

export const AttendanceUpload: React.FC<AttendanceUploadProps> = ({ onUploadSuccess }) => {
  const [month, setMonth] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [transportationFee, setTransportationFee] = useState('');
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [transportationFile, setTransportationFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const attendanceFileInputRef = useRef<HTMLInputElement>(null);
  const transportationFileInputRef = useRef<HTMLInputElement>(null);
  
  // 支持的文件类型
  const allowedFileTypes = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  // 处理文件验证
  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedFileTypes.includes(file.type) || 
                      allowedFileTypes.includes(fileExtension);
    
    if (!isValidType) {
      toast({
        title: "文件类型不支持",
        description: "请上传PDF、Word或Excel格式的文件",
        variant: "destructive",
      });
      return false;
    }
    
    // 文件大小限制为20MB
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "文件大小不能超过20MB",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  // 处理勤务表文件选择
  const handleAttendanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setAttendanceFile(selectedFile);
    } else if (e.target.value) {
      e.target.value = '';
    }
  };
  
  // 处理交通费文件选择
  const handleTransportationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setTransportationFile(selectedFile);
    } else if (e.target.value) {
      e.target.value = '';
    }
  };
  
  // 打开文件选择对话框
  const openFileSelector = (type: 'attendance' | 'transportation') => {
    if (type === 'attendance' && attendanceFileInputRef.current) {
      attendanceFileInputRef.current.click();
    } else if (type === 'transportation' && transportationFileInputRef.current) {
      transportationFileInputRef.current.click();
    }
  };
  
  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!month || !workHours || !transportationFee || !attendanceFile) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填字段并上传勤务表文件",
        variant: "destructive",
      });
      return;
    }
    
    // 验证月份格式 (YYYY-MM)
    if (!/^\d{4}-\d{2}$/.test(month)) {
      toast({
        title: "月份格式错误",
        description: "请使用YYYY-MM格式，例如：2023-05",
        variant: "destructive",
      });
      return;
    }
    
    // 验证工作时间是否为正数
    const parsedWorkHours = parseFloat(workHours);
    if (isNaN(parsedWorkHours) || parsedWorkHours <= 0) {
      toast({
        title: "勤务时间无效",
        description: "请输入有效的勤务时间（大于0的数字）",
        variant: "destructive",
      });
      return;
    }
    
    // 验证交通费是否为正数
    const parsedTransportationFee = parseFloat(transportationFee);
    if (isNaN(parsedTransportationFee) || parsedTransportationFee < 0) {
      toast({
        title: "交通费无效",
        description: "请输入有效的交通费（大于或等于0的数字）",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
        const uploadData: AttendanceUploadRequest = {
            file : attendanceFile, // 主要的勤务表文件
            month,
            workHours: parsedWorkHours,
            transportationFee: parsedTransportationFee,
            transportationFile  // 可选的交通费凭证文件
          };
      const response = await attendanceService.uploadAttendance(uploadData);
      
      toast({
        title: "上传成功",
        description: response.message || "勤务表和交通费信息已成功上传",
      });
      
      // 重置表单
      setMonth('');
      setWorkHours('');
      setTransportationFee('');
      setAttendanceFile(null);
      setTransportationFile(null);
      if (attendanceFileInputRef.current) attendanceFileInputRef.current.value = '';
      if (transportationFileInputRef.current) transportationFileInputRef.current.value = '';
      
      // 调用成功回调
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: "上传失败",
        description: "上传勤务表和交通费信息时发生错误",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // 下载模板
  const handleDownloadTemplate = async (type: 'attendance' | 'transportation') => {
    try {
      await attendanceService.downloadTemplate(type);
      toast({
        title: "下载成功",
        description: `${type === 'attendance' ? '勤务表' : '交通费'}模板已下载`
      });
    } catch (error) {
      toast({
        title: "下载失败",
        description: `无法下载${type === 'attendance' ? '勤务表' : '交通费'}模板`,
        variant: "destructive",
      });
    }
  };
  
  // 文件显示组件
  const FileDisplay = ({ file, type, onRemove }: { file: File, type: string, onRemove: () => void }) => (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-background/80">
      <div className="p-2 bg-primary/10 rounded">
        <FileText size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {type} · {(file.size / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 rounded-full hover:bg-muted transition-colors"
      >
        <XCircle size={16} className="text-muted-foreground" />
      </button>
    </div>
  );
  
  return (
    <Card className="glass-card animate-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">上传勤务表和交通费</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 月份 */}
            <div className="space-y-2">
              <Label htmlFor="month">
                勤务月份 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="YYYY-MM"
                required
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">格式：YYYY-MM</p>
            </div>
            
            {/* 工作时间 */}
            <div className="space-y-2">
              <Label htmlFor="workHours">
                勤务时间 (小时) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="workHours"
                type="number"
                value={workHours}
                onChange={(e) => setWorkHours(e.target.value)}
                placeholder="例如：160"
                min="0"
                step="0.5"
                required
                className="w-full"
              />
            </div>
            
            {/* 交通费 */}
            <div className="space-y-2">
              <Label htmlFor="transportationFee">
                交通费 (円) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="transportationFee"
                type="number"
                value={transportationFee}
                onChange={(e) => setTransportationFee(e.target.value)}
                placeholder="例如：5000"
                min="0"
                step="1"
                required
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* 勤务表文件上传 */}
            <div className="space-y-2">
              <Label htmlFor="attendanceFile">
                勤务表文件 <span className="text-red-500">*</span>
              </Label>
              
              {!attendanceFile ? (
                <div 
                  onClick={() => openFileSelector('attendance')} 
                  className="border-2 border-dashed border-primary/20 rounded-lg p-4 text-center hover:bg-primary/5 cursor-pointer transition-colors"
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary/70" />
                  <p className="text-sm text-muted-foreground mb-1">
                    点击上传勤务表文件
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 PDF, Word, Excel 格式
                  </p>
                  <Input
                    ref={attendanceFileInputRef}
                    id="attendanceFile"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleAttendanceFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <FileDisplay 
                  file={attendanceFile} 
                  type="勤务表文件" 
                  onRemove={() => {
                    setAttendanceFile(null);
                    if (attendanceFileInputRef.current) attendanceFileInputRef.current.value = '';
                  }} 
                />
              )}
              
              <div className="flex justify-end mt-1">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-xs h-auto p-0"
                  onClick={() => handleDownloadTemplate('attendance')}
                >
                  下载勤务表模板
                </Button>
              </div>
            </div>
            
            {/* 交通费文件上传 */}
            <div className="space-y-2">
              <Label htmlFor="transportationFile">
                交通费 <span className="text-muted-foreground text-xs">(可选)</span>
              </Label>
              
              {!transportationFile ? (
                <div 
                  onClick={() => openFileSelector('transportation')} 
                  className="border-2 border-dashed border-muted rounded-lg p-4 text-center hover:bg-muted/10 cursor-pointer transition-colors"
                >
                  <File className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-1">
                    点击上传交通费
                  </p>
                  <p className="text-xs text-muted-foreground">
                    支持 PDF, Word, Excel 格式
                  </p>
                  <Input
                    ref={transportationFileInputRef}
                    id="transportationFile"
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleTransportationFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <FileDisplay 
                  file={transportationFile} 
                  type="交通费" 
                  onRemove={() => {
                    setTransportationFile(null);
                    if (transportationFileInputRef.current) transportationFileInputRef.current.value = '';
                  }} 
                />
              )}
              
              <div className="flex justify-end mt-1">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-xs h-auto p-0"
                  onClick={() => handleDownloadTemplate('transportation')}
                >
                  下载交通费模板
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button type="submit" className="w-full md:w-auto" disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span> 上传中...
                </>
              ) : (
                <>提交</>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};