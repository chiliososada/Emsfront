import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Users, Settings, Home, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: '仪表板', path: '/', icon: Home },
    { name: '简历', path: '/resume', icon: FileText },
    { name: '面试问题', path: '/interview', icon: Users },
    { name: '设置', path: '/settings', icon: Settings },
  ];
  
  const handleLogout = () => {
    logout();
    toast.success('已成功退出登录');
    navigate('/login');
  };

  return (
    <div className="h-full bg-sidebar flex flex-col overflow-hidden">
      <div className="py-6 px-4 flex items-center justify-center">
        {!collapsed ? (
          <h1 className="text-white text-xl font-medium tracking-tight animate-fade-in">ToYouSoftEms</h1>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center">
            <span className="text-white font-semibold text-lg">T</span>
          </div>
        )}
      </div>
      
      <nav className="flex-1 py-4 px-2">
        <div className="space-y-1.5">
          {navigation.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`sidebar-link ${active ? 'active' : ''} ${
                  collapsed ? 'justify-center' : ''
                }`}
              >
                <item.icon size={collapsed ? 20 : 18} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>
      
      <div className="py-6 px-2">
        <div 
          className={`sidebar-link ${collapsed ? 'justify-center' : ''} cursor-pointer`}
          onClick={handleLogout}
        >
          <LogOut size={collapsed ? 20 : 18} />
          {!collapsed && <span>退出登录</span>}
        </div>
      </div>
    </div>
  );
};