import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Lock, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profileService, ProfileData } from '@/services/profileService';
import { authService, ChangePasswordRequest } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<ProfileData>({
    fullName: '',
    birthDate: '',
    birthPlace: '',
    introduction: '',
    hobbies: '',
  });
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  
  const { toast } = useToast();
  const { user: authUser } = useAuth(); // 获取当前登录用户信息
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await profileService.getProfile();
        setUser(profileData);
      } catch (error) {
        console.error('获取个人资料失败:', error);
        toast({
          title: "加载个人资料出错",
          description: "无法加载您的个人资料信息，请稍后再试。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [toast]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const response = await profileService.updateProfile(user);
      
      toast({
        title: "个人资料已更新",
        description: response.message || "您的个人资料信息已成功更新。",
      });
    } catch (error) {
      console.error('更新个人资料出错:', error);
      toast({
        title: "更新失败",
        description: "更新个人资料时发生错误。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "密码不匹配",
        description: "新密码与确认密码不匹配。",
        variant: "destructive",
      });
      return;
    }
    
    if (passwords.new.length < 8) {
      toast({
        title: "密码过短",
        description: "新密码长度必须至少为8个字符。",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const passwordData: ChangePasswordRequest = {
        currentPassword: passwords.current,
        newPassword: passwords.new
      };
      
      const response = await authService.changePassword(passwordData);
      
      toast({
        title: "密码已更新",
        description: response.message || "您的密码已成功更新。",
      });
      
      setPasswords({
        current: '',
        new: '',
        confirm: '',
      });
    } catch (error) {
      console.error('更新密码出错:', error);
      // 错误已在API服务中处理
    } finally {
      setIsLoading(false);
    }
  };

  // 用户类型对应的中文名称
  const getUserTypeText = (userType: number) => {
    switch (userType) {
      case 0: return '学生';
      case 1: return '教师';
      case 2: return '管理员';
      default: return '未知';
    }
  };

  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">设置</h1>
          <p className="text-muted-foreground mt-1">
            管理您的账户设置和偏好
          </p>
        </div>
        
        {/* 用户信息卡片 */}
        <Card className="glass-card animate-in bg-primary/5">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-primary/10 rounded-full p-4">
                <UserCircle size={64} className="text-primary" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight">{authUser?.username || '用户'}</h2>
                <p className="text-muted-foreground">
                   · ID: {authUser?.id || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card animate-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User size={18} className="text-muted-foreground" />
                <CardTitle>个人信息</CardTitle>
              </div>
              <CardDescription>
                更新您的个人信息和电子邮件地址
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">姓名</Label>
                  <Input
                    id="name"
                    value={user.fullName || ''}
                    onChange={(e) => setUser({ ...user, fullName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">出生日期</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={user.birthDate || ''}
                    onChange={(e) => setUser({ ...user, birthDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">出生地</Label>
                  <Input
                    id="birthPlace"
                    value={user.birthPlace || ''}
                    onChange={(e) => setUser({ ...user, birthPlace: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="introduction">个人介绍</Label>
                  <Textarea
                    id="introduction"
                    rows={3}
                    value={user.introduction || ''}
                    onChange={(e) => setUser({ ...user, introduction: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hobbies">兴趣爱好</Label>
                  <Textarea
                    id="hobbies"
                    rows={2}
                    value={user.hobbies || ''}
                    onChange={(e) => setUser({ ...user, hobbies: e.target.value })}
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '保存中...' : '保存更改'}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          <Card className="glass-card animate-in">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock size={18} className="text-muted-foreground" />
                <CardTitle>修改密码</CardTitle>
              </div>
              <CardDescription>
                更新您的密码以保持账户安全
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">当前密码</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
                
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !passwords.current || !passwords.new || !passwords.confirm}
                >
                  {isLoading ? '更新中...' : '更新密码'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;