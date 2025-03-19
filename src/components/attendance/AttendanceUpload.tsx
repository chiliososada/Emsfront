// src/components/attendance/AttendanceUpload.tsx
import React, { useState, useRef } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Upload, 
  XCircle, 
  FileSpreadsheet 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { attendanceService } from '@/services/attendanceService';

interface AttendanceUploadProps {
  onUploadSuccess?: () => void;
}

export const AttendanceUpload: React.FC<AttendanceUploadProps> = ({ onUploadSuccess }) => {
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [transportationFile, setTransportationFile] = useState<File | null>(null);
  const [month, setMonth] = useState('');
  const [workHours, setWorkHours] = useState<number>(0);
  const [transportationFee, setTransportationFee] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const attendanceFileInputRef = useRef<HTMLInputElement>(null);
  const transportationFileInputRef = useRef<HTMLInputElement>(null);
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // 支持的文件类型
  const allowedFileTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
  ];
  
  const validateFile = (file: File, fileType: 'attendance' | 'transportation') => {
    if (!allowedFileTypes.includes(file.type)) {
      toast({
        title: "文件类型不支持",
        description: "请上传Excel文件 (.xls, .xlsx)",
        variant: "destructive",
      });
      return false;
    }
    
    // 检查文件大小，限制为10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件太大",
        description: "文件大小不能超过10MB。",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const handleAttendanceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!validateFile(selectedFile, 'attendance')) {
        return;
      }
      setAttendanceFile(selectedFile);
    }
  };
  
  const handleTransportationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!validateFile(selectedFile, 'transportation')) {
        return;
      }
      setTransportationFile(selectedFile);
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
  
  const handleAttendanceDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!validateFile(droppedFile, 'attendance')) {
        return;
      }
      setAttendanceFile(droppedFile);
    }
  };
  
  const handleTransportationDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (!validateFile(droppedFile, 'transportation')) {
        return;
      }
      setTransportationFile(droppedFile);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleRemoveFile = (type: 'attendance' | 'transportation') => {
    if (type === 'attendance') {
      setAttendanceFile(null);
      if (attendanceFileInputRef.current) {
        attendanceFileInputRef.current.value = '';
      }
    } else {
      setTransportationFile(null);
      if (transportationFileInputRef.current) {
        transportationFileInputRef.current.value = '';
      }
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attendanceFile) {
      toast({
        title: "缺少勤务表文件",
        description: "请上传勤务表文件",
        variant: "destructive",
      });
      return;
    }
    
    if (!month) {
      toast({
        title: "请选择月份",
        description: "请选择勤务表所属月份",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const response = await attendanceService.uploadAttendance({
        month,
        workHours,
        transportationFee,
        file: attendanceFile,
        transportationFile: transportationFile || undefined
      });
      
      toast({
        title: "上传成功",
        description: response.message || "勤务表已成功上传",
      });
      
      // 重置表单
      setAttendanceFile(null);
      setTransportationFile(null);
      setMonth('');
      setWorkHours(0);
      setTransportationFee(0);
      
      // 调用成功回调
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: "上传失败",
        description: "勤务表上传过程中发生错误，请重试",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // 获取默认月份 (YYYY-MM格式，上个月)
  const getDefaultMonth = () => {
    let year = currentYear;
    let month = currentMonth - 1;
    
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    
    return `${year}-${month.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="glass-card animate-in overflow-hidden">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit}>
          <div className="p-5">
            <h3 className="text-lg font-medium mb-4">上传勤务表</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-4 md:col-span-1">
                <div className="space-y-2">
                  <Label htmlFor="month">
                    勤务月份 <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="month"
                      type="month"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      placeholder={getDefaultMonth()}
                      className="w-full"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    请选择勤务表所属月份 (例如: 2023-01)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="workHours">
                    工作时间 (小时)
                  </Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="workHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={workHours}
                      onChange={(e) => setWorkHours(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    请输入本月总工作时间
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transportationFee">
                    交通费 (¥)
                  </Label>
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="transportationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={transportationFee}
                      onChange={(e) => setTransportationFee(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    请输入本月交通费总额
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 md:col-span-1">
                <div className="space-y-2">
                  <Label>
                    勤务表文件 <span className="text-red-500">*</span>
                  </Label>
                  {!attendanceFile ? (
                    <div
                      onClick={() => openFileSelector('attendance')}
                      onDrop={handleAttendanceDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        拖放勤务表文件或点击此处上传
                      </p>
                      <p className="text-xs text-muted-foreground">
                        支持Excel格式 (.xls, .xlsx)
                      </p>
                      <Input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleAttendanceFileChange}
                        className="hidden"
                        ref={attendanceFileInputRef}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <FileSpreadsheet size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {attendanceFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(attendanceFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('attendance')}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <XCircle size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>
                    交通费凭证 (可选)
                  </Label>
                  {!transportationFile ? (
                    <div
                      onClick={() => openFileSelector('transportation')}
                      onDrop={handleTransportationDrop}
                      onDragOver={handleDragOver}
                      className="border-2 border-dashed border-muted rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        拖放交通费凭证或点击此处上传
                      </p>
                      <p className="text-xs text-muted-foreground">
                        支持Excel格式 (.xls, .xlsx)
                      </p>
                      <Input
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleTransportationFileChange}
                        className="hidden"
                        ref={transportationFileInputRef}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <FileSpreadsheet size={20} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {transportationFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(transportationFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile('transportation')}
                        className="p-1 rounded-full hover:bg-muted transition-colors"
                      >
                        <XCircle size={16} className="text-muted-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 border-t bg-muted/30 flex justify-end">
            <Button type="submit" className="w-full md:w-auto" disabled={isUploading || !attendanceFile || !month}>
              {isUploading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full"></span>
                  上传中...
                </span>
              ) : (
                "上传勤务表"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};