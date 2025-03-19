import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { 
  UserPlus, 
  RefreshCw, 
  Search, 
  UserCog, 
  KeyRound, 
  Users as UsersIcon, 
  Shield, 
  ShieldCheck,  
} from 'lucide-react';
import { userService, User } from '@/services/userService';

const UsersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.userType === 2;
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Form states for adding new user
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    userType: '0' // Default to Student
  });

  // Form state for password reset
  const [newPassword, setNewPassword] = useState('');
  
  // If not admin, redirect to home
  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      toast({
        title: "访问被拒绝",
        description: "您没有权限访问用户管理页面",
        variant: "destructive",
      });
    }
  }, [isAdmin, navigate]);
  
  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('无法加载用户列表。请稍后再试。');
        toast({
          title: "加载失败",
          description: "无法获取用户列表数据",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isAdmin, refreshTrigger]);
  
  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    return users.filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);
  
  // Get user type text
  const getUserTypeText = (userType: number): string => {
    switch (userType) {
      case 0: return '学生';
      case 1: return '教师';
      case 2: return '管理员';
      default: return '未知';
    }
  };
  
  // Get user type badge
  const getUserTypeBadge = (userType: number) => {
    switch (userType) {
      case 0:
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Shield size={12} />
          学生
        </Badge>;
      case 1:
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200 flex items-center gap-1">
          <ShieldCheck size={12} />
          教师
        </Badge>;
      case 2:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1">
          <Shield size={12} />
          管理员
        </Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };
  
  // Handle add user
  const handleAddUser = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!newUser.username || !newUser.email || !newUser.password) {
        toast({
          title: "表单不完整",
          description: "请填写所有必填字段",
          variant: "destructive",
        });
        return;
      }
      
      // Call API to add user
      await userService.addUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        userType: parseInt(newUser.userType)
      });
      
      // Success
      toast({
        title: "用户已创建",
        description: `用户 "${newUser.username}" 已成功创建`,
      });
      
      // Reset form and close dialog
      setNewUser({
        username: '',
        email: '',
        password: '',
        userType: '0'
      });
      setShowAddUserDialog(false);
      
      // Refresh user list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add user:', error);
      toast({
        title: "创建用户失败",
        description: "无法创建新用户，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle reset password
  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      setLoading(true);
      
      // Validation
      if (!newPassword) {
        toast({
          title: "密码为空",
          description: "请输入新密码",
          variant: "destructive",
        });
        return;
      }
      
      // Call API to reset password with correct property names
      await userService.resetPassword(selectedUser.userID, newPassword);
      
      // Success
      toast({
        title: "密码已重置",
        description: `用户 "${selectedUser.username}" 的密码已成功重置`,
      });
      
      // Reset form and close dialog
      setNewPassword('');
      setShowResetPasswordDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to reset password:', error);
      toast({
        title: "重置密码失败",
        description: "无法重置用户密码，请重试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // If not admin, don't render the page
  if (!isAdmin) {
    return null;
  }
  
  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
            <p className="text-muted-foreground mt-1">
              管理系统用户、权限和重置密码
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setRefreshTrigger(prev => prev + 1)}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              刷新
            </Button>
            <Button
              className="flex items-center gap-2"
              onClick={() => setShowAddUserDialog(true)}
            >
              <UserPlus size={16} />
              添加用户
            </Button>
          </div>
        </div>
        
        {/* Search and filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="搜索用户名或邮箱..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Users table */}
        <Card className="glass-card overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <UsersIcon size={18} />
              用户列表
            </CardTitle>
            <CardDescription>
              系统中的所有用户账号
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="p-8 text-center">
                <div className="rounded-full bg-red-50 p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <RefreshCw size={24} className="text-red-500" />
                </div>
                <p className="text-lg font-medium mb-2">加载失败</p>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={() => setRefreshTrigger(prev => prev + 1)}>
                  重试
                </Button>
              </div>
            ) : loading && users.length === 0 ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-muted-foreground">加载用户数据...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <div className="rounded-full bg-muted p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <UsersIcon size={24} className="text-muted-foreground" />
                </div>
                <p className="text-lg font-medium mb-2">未找到用户</p>
                <p className="text-muted-foreground">没有符合搜索条件的用户</p>
              </div>
            ) : (
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>用户名</TableHead>
                      <TableHead>邮箱</TableHead>
                      <TableHead>用户类型</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.userID} className="animate-in">
                        <TableCell className="font-mono">{user.userID}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "outline" : "destructive"} className="capitalize">
                            {user.isActive ? '活跃' : '已禁用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowResetPasswordDialog(true);
                              }}
                              title="重置密码"
                            >
                              <KeyRound size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                // TODO: Edit user functionality
                                toast({
                                  title: "功能尚未实现",
                                  description: "编辑用户功能正在开发中",
                                });
                              }}
                              title="编辑用户"
                            >
                              <UserCog size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add user dialog */}
      <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加新用户</DialogTitle>
            <DialogDescription>
              创建新用户账号并设置初始密码
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名 <span className="text-red-500">*</span></Label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱 <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="请输入电子邮箱"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">初始密码 <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="请输入初始密码"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userType">用户类型 <span className="text-red-500">*</span></Label>
              <Select
                value={newUser.userType}
                onValueChange={(value) => setNewUser({ ...newUser, userType: value })}
              >
                <SelectTrigger id="userType">
                  <SelectValue placeholder="选择用户类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">学生</SelectItem>
                  <SelectItem value="1">教师</SelectItem>
                  <SelectItem value="2">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAddUserDialog(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button 
              onClick={handleAddUser}
              disabled={loading || !newUser.username || !newUser.email || !newUser.password}
            >
              {loading ? '处理中...' : '创建用户'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reset password dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重置用户密码</DialogTitle>
            <DialogDescription>
              {selectedUser ? `为用户 "${selectedUser.username}" 设置新密码` : '为所选用户设置新密码'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码 <span className="text-red-500">*</span></Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowResetPasswordDialog(false);
                setNewPassword('');
                setSelectedUser(null);
              }}
              disabled={loading}
            >
              取消
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={loading || !newPassword}
            >
              {loading ? '处理中...' : '重置密码'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;