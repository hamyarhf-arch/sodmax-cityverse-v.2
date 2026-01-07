import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store';
import {
  Home,
  Zap,
  Target,
  Wallet,
  User,
  Users,
  Gift,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronRight,
} from 'lucide-react';

const MainLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'داشبورد', icon: Home },
    { path: '/mining', label: 'استخراج', icon: Zap },
    { path: '/campaigns', label: 'کمپین‌ها', icon: Target },
    { path: '/wallet', label: 'کیف پول', icon: Wallet },
    { path: '/referrals', label: 'دعوت دوستان', icon: Users },
    { path: '/rewards', label: 'پاداش‌ها', icon: Gift },
    { path: '/profile', label: 'پروفایل', icon: User },
    { path: '/settings', label: 'تنظیمات', icon: Settings },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const NotificationsPanel = () => {
    const notifications = [
      { id: 1, title: 'کمپین جدید', message: 'کمپین دیجی‌کالا فعال شد', time: '۵ دقیقه پیش', read: false },
      { id: 2, title: 'استخراج موفق', message: '۵۰۰ SOD دریافت کردید', time: '۱ ساعت پیش', read: true },
      { id: 3, title: 'دعوت تأیید شد', message: 'دوست شما ثبت‌نام کرد', time: '۲ روز پیش', read: true },
    ];

    return (
      <div className="absolute top-16 right-4 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-bold text-lg">اعلان‌ها</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-b border-gray-700 hover:bg-gray-750 cursor-pointer ${
                !notif.read ? 'bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${!notif.read ? 'bg-blue-500' : 'bg-gray-600'}`}>
                  <Bell size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{notif.title}</h4>
                  <p className="text-sm text-gray-300 mt-1">{notif.message}</p>
                  <span className="text-xs text-gray-400 mt-2 block">{notif.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-64 bg-gray-900 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">SODmAX</h1>
                  <p className="text-xs text-gray-400">CityVerse</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-blue-400 border-r-4 border-blue-500'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight size={16} className="mr-auto" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/20 text-red-400"
              >
                <LogOut size={20} />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-l border-gray-800">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">SODmAX</h1>
              <p className="text-xs text-gray-400">CityVerse</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border-r-4 border-blue-500'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                  {isActive && <ChevronRight size={16} className="mr-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-bold">{user?.name}</h3>
              <p className="text-xs text-gray-400">سطح {user?.level || 1}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-red-500/20 text-red-400"
          >
            <LogOut size={20} />
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold">
                {navItems.find((item) => item.path === location.pathname)?.label || 'داشبورد'}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-gray-800 rounded-lg"
                >
                  <Bell size={22} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                {notificationsOpen && <NotificationsPanel />}
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="font-bold">{user?.name}</p>
                  <p className="text-sm text-gray-400">
                    موجودی: {user?.user_wallets?.[0]?.sod_balance?.toLocaleString() || 0} SOD
                  </p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
