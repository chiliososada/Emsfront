import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);

      if (success) {
        navigate('/');
      }
    } catch (error) {
      console.error('登录错误:', error);
      toast.error('发生意外错误，请重试。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="glass-card shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">ToYouSoftEMS</CardTitle>
            <CardDescription className="text-center">
              请输入您的账号密码登录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  placeholder="请输入用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '登录中...' : '登录'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center flex-col items-center">
            <p className="text-sm text-muted-foreground mb-2">

            </p>
          </CardFooter>
        </Card>
      </div>

      {/* 固定显示的公司名称 */}
      <div className="mt-8 text-center">
        <p className="text-lg font-semibold text-gray-600">東陽ソフト株式会社</p>
        <p className="text-sm text-gray-500 mt-1">&copy; {new Date().getFullYear()} </p>
      </div>
    </div>
  );
};

export default Login;