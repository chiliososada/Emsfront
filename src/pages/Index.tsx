import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, ArrowUp, ArrowDown, BookOpen, Activity, User, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardData {
  questionStats: {
    totalQuestions: number;
    personalQuestions: number;
    companyQuestions: number;
  };
  caseStats: {
    activeCases: number;
  };
  resumeStats: {
    pendingResumes: number;
    approvedResumes: number;
    rejectedResumes: number;
    totalResumes: number;
  };
  userStats?: {
    totalUsers: number;
    activeUsers: number;
    studentCount: number;
    teacherCount: number;
    adminCount: number;
  };
}

const DashboardCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  change, 
  link,
  className
}: { 
  title: string; 
  value: string | number; 
  description?: string; 
  icon: React.ElementType; 
  change?: { value: number; positive: boolean }; 
  link: string;
  className?: string;
}) => (
  <Card className={`glass-card hover-scale ${className}`}>
    <Link to={link} className="block h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {change && (
            <span className={`flex items-center text-xs mr-2 ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
              {change.positive ? <ArrowUp className="mr-1 h-3 w-3" /> : <ArrowDown className="mr-1 h-3 w-3" />}
              {Math.abs(change.value)}%
            </span>
          )}
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
      </CardContent>
    </Link>
  </Card>
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const isAdmin = user?.userType === 2; // 2 = Admin

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const data = await apiRequest('/Dashboard');
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('无法加载仪表板数据。请稍后再试。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-transition">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
          <p className="text-muted-foreground mt-1">
            欢迎回来！这是您活动的概览。
          </p>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="glass-card hover-scale animate-pulse">
                <div className="h-32"></div>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="glass-card p-6 text-center">
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              重试
            </Button>
          </Card>
        ) : dashboardData ? (
          <>
            {/* 问题和简历卡片 - 2列布局 */}
            <div className="grid gap-4 md:grid-cols-2">
              <DashboardCard
                title="简历统计"
                value={dashboardData.resumeStats.totalResumes}
                description={`${dashboardData.resumeStats.pendingResumes} 个待审核`}
                icon={FileText}
                change={{ 
                  value: dashboardData.resumeStats.totalResumes > 0 
                    ? Math.round((dashboardData.resumeStats.approvedResumes / dashboardData.resumeStats.totalResumes) * 100) 
                    : 0, 
                  positive: true 
                }}
                link="/resume"
              />
              <DashboardCard
                title="面试问题"
                value={dashboardData.questionStats.totalQuestions}
                description={`${dashboardData.questionStats.personalQuestions} 个个人问题`}
                icon={Users}
                change={{ 
                  value: dashboardData.questionStats.totalQuestions > 0
                    ? Math.round((dashboardData.questionStats.companyQuestions / dashboardData.questionStats.totalQuestions) * 100)
                    : 0, 
                  positive: true 
                }}
                link="/interview"
              />
            </div>
            
            {/* 详细统计卡片 - 4列布局 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
              <DashboardCard
                title="已批准简历"
                value={dashboardData.resumeStats.approvedResumes}
                description={`共 ${dashboardData.resumeStats.totalResumes} 份简历`}
                icon={FileText}
                change={{ 
                  value: dashboardData.resumeStats.totalResumes > 0 
                    ? Math.round((dashboardData.resumeStats.approvedResumes / dashboardData.resumeStats.totalResumes) * 100) 
                    : 0, 
                  positive: true 
                }}
                link="/resume"
                className="md:col-span-1"
              />
              <DashboardCard
                title="已拒绝简历"
                value={dashboardData.resumeStats.rejectedResumes}
                description={`共 ${dashboardData.resumeStats.totalResumes} 份简历`}
                icon={FileText}
                change={{ 
                  value: dashboardData.resumeStats.totalResumes > 0 
                    ? Math.round((dashboardData.resumeStats.rejectedResumes / dashboardData.resumeStats.totalResumes) * 100) 
                    : 0, 
                  positive: false 
                }}
                link="/resume"
                className="md:col-span-1"
              />
              <DashboardCard
                title="公司问题"
                value={dashboardData.questionStats.companyQuestions}
                description={`共 ${dashboardData.questionStats.totalQuestions} 个问题`}
                icon={Activity}
                link="/interview"
                className="md:col-span-1"
              />
            </div>
            
            {/* 管理员专属统计 */}
            {isAdmin && dashboardData.userStats && (
              <div className="mt-2">
                <h2 className="text-xl font-bold mb-4">用户统计</h2>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
                  <DashboardCard
                    title="总用户数"
                    value={dashboardData.userStats.totalUsers}
                    description={`${dashboardData.userStats.activeUsers} 个活跃用户`}
                    icon={User}
                    link="/users"
                    className="md:col-span-1"
                  />
                  <DashboardCard
                    title="学生用户"
                    value={dashboardData.userStats.studentCount}
                    description={`${Math.round((dashboardData.userStats.studentCount / dashboardData.userStats.totalUsers) * 100)}% 的用户`}
                    icon={User}
                    link="/users?type=student"
                    className="md:col-span-1"
                  />
                  <DashboardCard
                    title="教师用户"
                    value={dashboardData.userStats.teacherCount}
                    description={`${Math.round((dashboardData.userStats.teacherCount / dashboardData.userStats.totalUsers) * 100)}% 的用户`}
                    icon={UserCheck}
                    link="/users?type=teacher"
                    className="md:col-span-1"
                  />
                  <DashboardCard
                    title="管理员"
                    value={dashboardData.userStats.adminCount}
                    description={`${Math.round((dashboardData.userStats.adminCount / dashboardData.userStats.totalUsers) * 100)}% 的用户`}
                    icon={UserCheck}
                    link="/users?type=admin"
                    className="md:col-span-1"
                  />
                  <DashboardCard
                    title="活跃率"
                    value={`${Math.round((dashboardData.userStats.activeUsers / dashboardData.userStats.totalUsers) * 100)}%`}
                    description={`${dashboardData.userStats.activeUsers} / ${dashboardData.userStats.totalUsers}`}
                    icon={Activity}
                    link="/users"
                    className="md:col-span-1"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <DashboardCard
              title="简历"
              value={0}
              description="无数据"
              icon={FileText}
              link="/resume"
            />
            <DashboardCard
              title="面试问题"
              value={0}
              description="无数据"
              icon={Users}
              link="/interview"
            />
          </div>
        )}
        
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle>欢迎使用 ToYouSoftEms</CardTitle>
            <CardDescription>公司内部的管理系统</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>ToYouSoftEms 帮助您管理专业发展历程。</p>
              <p>使用侧边栏导航到不同板块：</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>查看并更新您的<strong>简历</strong></li>
                <li>通过练习问题为<strong>面试</strong>做准备</li>
                <li>管理您的<strong>设置</strong>和个人信息</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;